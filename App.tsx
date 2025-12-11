import React, { useState, useRef, useEffect } from 'react';
import { InterviewType, InterviewState, FeedbackData, StoredSession, ProblemInfo, NotionConnection } from './types';
import { SYSTEM_PROMPTS, getRandomProblem } from './constants';
import { createChatSession, generateInterviewFeedback } from './services/gemini';
import { saveSession, getSessions, deleteSession, getNotionConnection, saveNotionConnection, clearNotionConnection } from './services/storage';
import { saveToNotion, isNotionConfigured } from './services/notion';
import { redirectToNotionAuth, completeNotionAuth } from './services/notionAuth';
import { Chat } from '@google/genai';
import { Code, Users, Layout, Loader2, Sparkles, History } from './components/Icons';
import InterviewSession from './components/InterviewSession';
import FeedbackDisplay from './components/FeedbackDisplay';
import HistoryView from './components/HistoryView';
import ReviewSession from './components/ReviewSession';

type ViewMode = 'HOME' | 'HISTORY' | 'REVIEW';

const INTERVIEWER_NAMES = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Jamie", "Riley", "Avery", "Sarah", "Michael", "David", "Emily", "Chris", "Pat"];

const App: React.FC = () => {
  const [interviewState, setInterviewState] = useState<InterviewState>({
    isActive: false,
    type: null,
    messages: [],
    codeOrNotes: '',
    isLoading: false,
  });
  
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('HOME');
  const [selectedSession, setSelectedSession] = useState<StoredSession | null>(null);
  const [history, setHistory] = useState<StoredSession[]>([]);
  const [notionConnection, setNotionConnection] = useState<NotionConnection | null>(null);
  const [notionDatabaseIdInput, setNotionDatabaseIdInput] = useState<string>('');
  const [isCompletingNotionAuth, setIsCompletingNotionAuth] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Load history on mount
  useEffect(() => {
    setHistory(getSessions());

    // Load any existing Notion connection from localStorage
    const existingConnection = getNotionConnection();
    if (existingConnection) {
      setNotionConnection(existingConnection);
      setNotionDatabaseIdInput(existingConnection.databaseId ?? '');
    }

    // Handle Notion OAuth redirect: look for ?code= in the URL
    // Per Notion public OAuth docs:
    // https://developers.notion.com/docs/authorization#public-integration-authorization-overview
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    
    if (code) {
      setIsCompletingNotionAuth(true);
      completeNotionAuth(code)
        .then((conn) => {
          setNotionConnection(conn);
          // Clear query params so refreshes look clean
          url.searchParams.delete('code');
          url.searchParams.delete('notion_oauth');
          window.history.replaceState({}, document.title, url.toString());
          alert(`Connected to Notion workspace${conn.workspaceName ? `: ${conn.workspaceName}` : ''}`);
        })
        .catch((err) => {
          console.error('Failed to complete Notion OAuth', err);
          alert('Failed to connect to Notion. Please try again.');
        })
        .finally(() => {
          setIsCompletingNotionAuth(false);
        });
    }
  }, []);

  const handleConnectNotionClick = async () => {
    try {
      await redirectToNotionAuth();
    } catch (e) {
      console.error(e);
      alert('Failed to start Notion authorization. Check the OAuth server is running.');
    }
  };

  const handleSaveNotionDatabaseId = () => {
    const trimmed = notionDatabaseIdInput.trim();
    if (!trimmed) {
      alert('Please paste a Notion database ID.');
      return;
    }
    const current: Partial<NotionConnection> = notionConnection ?? {};
    const updated: NotionConnection = {
      accessToken: current.accessToken || '',
      refreshToken: current.refreshToken,
      workspaceId: current.workspaceId,
      workspaceName: current.workspaceName,
      workspaceIcon: current.workspaceIcon ?? null,
      botId: current.botId,
      databaseId: trimmed,
    };
    setNotionConnection(updated);
    saveNotionConnection(updated);
    alert('Saved Notion database ID. Future reports will be sent there.');
  };

  const handleDisconnectNotion = () => {
    setNotionConnection(null);
    setNotionDatabaseIdInput('');
    clearNotionConnection();
  };

  const refreshHistory = () => {
    setHistory(getSessions());
  };

  const startInterview = async (type: InterviewType) => {
    setInterviewState(prev => ({ ...prev, isLoading: true }));
    
    // Pick a random name
    const interviewerName = INTERVIEWER_NAMES[Math.floor(Math.random() * INTERVIEWER_NAMES.length)];
    
    // For technical interviews, randomly select a NeetCode 150 problem
    let selectedProblem: ProblemInfo | undefined;
    let initialPrompt: string;
    
    const config = SYSTEM_PROMPTS[type];
    // Inject name into system instruction to enforce persona
    const systemInstructionWithPersona = `${config.systemInstruction}\n\nIMPORTANT: Your name is ${interviewerName}. Always maintain this persona and introduce yourself as ${interviewerName}.`;

    const chat = createChatSession(systemInstructionWithPersona);
    chatSessionRef.current = chat;

    if (type === 'TECHNICAL') {
      // Randomly select a problem from NeetCode 150
      const problem = getRandomProblem();
      selectedProblem = {
        id: problem.id,
        name: problem.name,
        difficulty: problem.difficulty,
        category: problem.category,
      };
      // Don't mention the LeetCode number or problem name - just present the problem naturally
      initialPrompt = `Introduce yourself as ${interviewerName}. Present LeetCode #${problem.id} "${problem.name}" naturally—don't mention LeetCode or the problem name. Describe the problem clearly, then follow the UMPIRE method.`;
    } else {
      initialPrompt = `The interview is starting now. Please introduce yourself as ${interviewerName} and present the first question/problem as per your instructions.`;
    }

    try {
        const result = await chat.sendMessageStream({ message: initialPrompt });
        
        let initialResponse = '';
        for await (const chunk of result) {
            if (chunk.text) initialResponse += chunk.text;
        }

        setInterviewState({
            isActive: true,
            type: type,
            messages: [{ role: 'model', text: initialResponse, timestamp: Date.now() }],
            codeOrNotes: '',
            isLoading: false,
            problemInfo: selectedProblem,
        });

    } catch (e) {
        console.error("Failed to start", e);
        setInterviewState(prev => ({ ...prev, isLoading: false }));
        alert("Failed to connect to AI. Please check your API key.");
    }
  };

  const endInterview = async () => {
    if (!interviewState.type) return;

    setInterviewState(prev => ({ ...prev, isLoading: true }));
    
    try {
        const feedbackData = await generateInterviewFeedback(
            interviewState.messages,
            interviewState.codeOrNotes,
            interviewState.type
        );
        
        // Save to History
        const newSession: StoredSession = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            type: interviewState.type,
            messages: interviewState.messages,
            codeOrNotes: interviewState.codeOrNotes,
            feedback: feedbackData,
            problemInfo: interviewState.problemInfo,
        };
        saveSession(newSession);
        refreshHistory();

        // Save to Notion (if configured for this browser)
        if (isNotionConfigured()) {
            saveToNotion(newSession, notionConnection).then(result => {
                if (result.success) {
                    console.log('✅ Session synced to Notion');
                } else {
                    console.warn('⚠️ Failed to sync to Notion:', result.error);
                }
            });
        }

        setFeedback(feedbackData);
        setInterviewState(prev => ({ ...prev, isActive: false }));
    } catch (e) {
        console.error(e);
        alert("Error generating feedback.");
    } finally {
        setInterviewState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const resetApp = () => {
    setFeedback(null);
    setInterviewState({
        isActive: false,
        type: null,
        messages: [],
        codeOrNotes: '',
        isLoading: false
    });
    chatSessionRef.current = null;
    setViewMode('HOME');
    setSelectedSession(null);
  };

  const handleDeleteSession = (id: string) => {
      deleteSession(id);
      refreshHistory();
  };

  const handleSelectSession = (session: StoredSession) => {
      setSelectedSession(session);
      setViewMode('REVIEW');
  };

  // 1. Loading State
  if (interviewState.isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 size={48} className="animate-spin text-primary" />
        <p className="text-slate-400 font-medium animate-pulse">
            {feedback ? "Analyzing your performance..." : "Preparing interview environment..."}
        </p>
      </div>
    );
  }

  // 2. Feedback View (Immediately after interview)
  if (feedback) {
    return <FeedbackDisplay data={feedback} onHome={resetApp} />;
  }

  // 3. Active Interview View
  if (interviewState.isActive && interviewState.type) {
    return (
      <InterviewSession 
        type={interviewState.type}
        messages={interviewState.messages}
        setMessages={(fn) => setInterviewState(prev => ({ ...prev, messages: typeof fn === 'function' ? fn(prev.messages) : fn }))}
        codeOrNotes={interviewState.codeOrNotes}
        setCodeOrNotes={(fn) => setInterviewState(prev => ({ ...prev, codeOrNotes: typeof fn === 'function' ? fn(prev.codeOrNotes) : fn }))}
        chatSession={chatSessionRef}
        onEndInterview={endInterview}
        isSending={isSending}
        setIsSending={setIsSending}
      />
    );
  }

  // 4. History View
  if (viewMode === 'HISTORY') {
      return (
          <HistoryView 
            sessions={history} 
            onSelectSession={handleSelectSession} 
            onDeleteSession={handleDeleteSession}
            onHome={() => setViewMode('HOME')} 
          />
      );
  }

  // 5. Review View
  if (viewMode === 'REVIEW' && selectedSession) {
      return (
          <ReviewSession 
            session={selectedSession} 
            onBack={() => setViewMode('HISTORY')} 
          />
      );
  }

  // 6. Landing / Selection View
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-primary/30">
        <div className="max-w-6xl mx-auto px-6 py-20 relative">
            
            {/* History Button */}
            <div className="absolute top-6 right-6">
                <button 
                    onClick={() => setViewMode('HISTORY')}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium border border-slate-700"
                >
                    <History size={16} />
                    History
                </button>
            </div>

            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-full px-4 py-1 text-sm text-slate-300 mb-4">
                    <Sparkles size={14} className="text-yellow-400" />
                    <span>AI-Powered Interview Prep</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    Mockdy
                </h1>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                    Master your software engineering interviews. 
                    Real-time AI feedback for Coding, Behavior, and System Design.
                </p>
            </div>

            {/* Notion connection panel */}
            <div className="max-w-2xl mx-auto mb-10 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-left space-y-1">
                <p className="text-sm font-semibold text-slate-200">
                  Notion workspace connection
                </p>
                <p className="text-xs text-slate-400">
                  Connect your own Notion workspace and paste the database ID where you want interview reports stored.
                </p>
                {notionConnection && (
                  <p className="text-xs text-slate-400">
                    Connected workspace{notionConnection.workspaceName ? `: ${notionConnection.workspaceName}` : ''}.
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 md:items-end w-full md:w-auto">
                <div className="flex gap-2 w-full">
                  <input
                    type="text"
                    value={notionDatabaseIdInput}
                    onChange={(e) => setNotionDatabaseIdInput(e.target.value)}
                    placeholder="Notion database ID"
                    className="flex-1 bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleSaveNotionDatabaseId}
                    className="px-3 py-1.5 text-xs font-medium bg-primary text-slate-950 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Save DB
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleConnectNotionClick}
                    disabled={isCompletingNotionAuth}
                    className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-100 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors disabled:opacity-60"
                  >
                    {notionConnection ? 'Reconnect Notion' : 'Connect Notion'}
                  </button>
                  {notionConnection && (
                    <button
                      onClick={handleDisconnectNotion}
                      className="px-3 py-1.5 text-xs font-medium bg-transparent text-slate-400 rounded-lg border border-slate-800 hover:border-red-500 hover:text-red-300 transition-colors"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card 
                    title="Technical Interview"
                    desc="NeetCode 150 style questions. Data structures, algorithms, and Big O analysis."
                    icon={<Code size={32} />}
                    color="text-accent"
                    onClick={() => startInterview('TECHNICAL')}
                />
                <Card 
                    title="Behavioral Interview"
                    desc="Master the STAR method. Prepare for 'Tell me about a time...' questions."
                    icon={<Users size={32} />}
                    color="text-primary"
                    onClick={() => startInterview('BEHAVIORAL')}
                />
                <Card 
                    title="System Design"
                    desc="Architect scalable systems like URL Shorteners or Chat Apps from scratch."
                    icon={<Layout size={32} />}
                    color="text-purple-400"
                    onClick={() => startInterview('SYSTEM_DESIGN')}
                />
            </div>

            <footer className="mt-20 text-center text-slate-600 text-sm">
                <p>Powered by Google Gemini 2.5 Flash</p>
            </footer>
        </div>
    </div>
  );
};

// Sub-component for selection cards
const Card: React.FC<{ title: string, desc: string, icon: React.ReactNode, color: string, onClick: () => void }> = ({ title, desc, icon, color, onClick }) => (
    <button 
        onClick={onClick}
        className="group relative flex flex-col items-start p-8 bg-slate-800 rounded-2xl border border-slate-700 hover:border-slate-500 hover:bg-slate-800/80 transition-all duration-300 text-left shadow-lg hover:shadow-2xl hover:-translate-y-1"
    >
        <div className={`mb-6 p-4 rounded-xl bg-slate-900/50 ${color} shadow-inner`}>
            {icon}
        </div>
        <h3 className="text-2xl font-bold mb-3 text-slate-100 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-slate-400 leading-relaxed mb-6">{desc}</p>
        <div className="mt-auto flex items-center text-sm font-semibold text-white/50 group-hover:text-white transition-colors">
            Start Session <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
        </div>
    </button>
);

export default App;