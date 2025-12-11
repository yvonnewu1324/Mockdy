import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Square, Loader2, Mic, MicOff, Volume2, VolumeX, Clock, Play, Terminal, X } from './Icons';
import { Message, InterviewType } from '../types';
import { Chat } from '@google/genai';

interface InterviewSessionProps {
  type: InterviewType;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  codeOrNotes: string;
  setCodeOrNotes: React.Dispatch<React.SetStateAction<string>>;
  chatSession: React.MutableRefObject<Chat | null>;
  onEndInterview: () => void;
  isSending: boolean;
  setIsSending: React.Dispatch<React.SetStateAction<boolean>>;
}

// Global declaration for Pyodide
declare global {
  interface Window {
    loadPyodide: (config?: any) => Promise<any>;
  }
}

const InterviewSession: React.FC<InterviewSessionProps> = ({
  type,
  messages,
  setMessages,
  codeOrNotes,
  setCodeOrNotes,
  chatSession,
  onEndInterview,
  isSending,
  setIsSending
}) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true); // Default ON
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showScrollbar, setShowScrollbar] = useState(false);
  
  // Code Execution State
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [codeOutput, setCodeOutput] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<any>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Voice Input Refs
  const recognitionRef = useRef<any>(null);
  const inputBaseRef = useRef('');
  
  // Random voice gender for this session (persists for entire interview)
  const voiceGenderRef = useRef<'male' | 'female'>(Math.random() > 0.5 ? 'male' : 'female');

  const isTechnical = type === 'TECHNICAL';
  const isSystemDesign = type === 'SYSTEM_DESIGN';
  const showEditor = isTechnical || isSystemDesign;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea when input changes (including voice input)
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = newHeight + 'px';
      setShowScrollbar(textarea.scrollHeight > 200);
    }
  }, [input]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  // Load Pyodide for Technical Interviews
  useEffect(() => {
    if (isTechnical && !pyodide) {
        setIsPyodideLoading(true);
        const load = async () => {
            try {
                if (window.loadPyodide) {
                    const py = await window.loadPyodide();
                    setPyodide(py);
                    setIsPyodideLoading(false);
                } else {
                    // Retry if script hasn't loaded yet
                    setTimeout(load, 500);
                }
            } catch (e) {
                console.error("Failed to load Pyodide:", e);
                setIsPyodideLoading(false);
            }
        };
        load();
    }
  }, [isTechnical, pyodide]);

  // Initialize Speech Recognition & Preload Voices
  useEffect(() => {
    // Recognition
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i][0].transcript;
          // Add space if transcript isn't empty and previous char wasn't a space
          if (transcript && !transcript.endsWith(' ') && !result.startsWith(' ')) {
             transcript += ' ';
          }
          transcript += result;
        }
        
        const base = inputBaseRef.current;
        // Ensure space between base input and new transcript
        const spacing = (base && !base.endsWith(' ') && transcript && !transcript.startsWith(' ')) ? ' ' : '';
        const newValue = base + spacing + transcript;
        setInput(newValue);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Preload Voices (Chrome often loads async)
    const loadVoices = () => {
        window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    // Stop TTS if user wants to speak (Barge-in)
    window.speechSynthesis.cancel();

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      inputBaseRef.current = input;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text: string) => {
      if (!window.speechSynthesis) return;
      
      // Remove code blocks and markdown symbols for smoother speech
      const cleanText = text
        .replace(/```[\s\S]*?```/g, "Code block omitted.")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/[*_~]/g, "");

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const voices = window.speechSynthesis.getVoices();
      const gender = voiceGenderRef.current;
      
      // Common female voice name patterns
      const femalePatterns = ['female', 'woman', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'alex', 'allison', 'ava', 'susan', 'zira', 'hazel', 'linda', 'catherine', 'princess'];
      // Common male voice name patterns  
      const malePatterns = ['male', 'man', 'daniel', 'tom', 'thomas', 'david', 'mark', 'james', 'fred', 'ralph', 'albert', 'bruce', 'junior', 'aaron', 'gordon', 'oliver', 'george', 'rishi'];
      
      const patterns = gender === 'female' ? femalePatterns : malePatterns;
      
      // Find a voice matching the gender (English voices preferred)
      let selectedVoice = voices.find(v => {
          const nameLower = v.name.toLowerCase();
          const isEnglish = v.lang.startsWith('en');
          return isEnglish && patterns.some(p => nameLower.includes(p));
      });
      
      // Fallback: Try Google voices with gender hint
      if (!selectedVoice) {
          selectedVoice = voices.find(v => {
              const nameLower = v.name.toLowerCase();
              if (gender === 'female') {
                  return nameLower.includes('google') && nameLower.includes('female');
              } else {
                  return nameLower.includes('google') && nameLower.includes('male');
              }
          });
      }
      
      // Final fallback: any English voice
      if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang.startsWith('en'));
      }
      
      if (selectedVoice) utterance.voice = selectedVoice;
      
      // Adjust pitch slightly based on gender for more natural sound
      utterance.rate = 1.05;
      utterance.pitch = gender === 'female' ? 1.1 : 0.9;
      
      window.speechSynthesis.speak(utterance);
  };

  // Speak the initial greeting when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
        if (isSoundEnabled && messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'model') {
                speak(lastMsg.text);
            }
        }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !chatSession.current || isSending) return;

    window.speechSynthesis.cancel(); // Stop any ongoing speech

    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    }

    const userText = input;
    setInput('');
    setShowScrollbar(false);
    setIsSending(true);
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    const userMsg: Message = { role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await chatSession.current.sendMessageStream({ message: userText });
      
      let fullResponseText = '';
      
      setMessages(prev => [
        ...prev, 
        { role: 'model', text: '', timestamp: Date.now() }
      ]);

      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          fullResponseText += text;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg.role === 'model') {
                lastMsg.text = fullResponseText;
            }
            return newMessages;
          });
        }
      }

      // Speak response if enabled
      if (isSoundEnabled) {
          speak(fullResponseText);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ Error: Connection interrupted. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleRunCode = async () => {
    if (isRunningCode || !codeOrNotes.trim()) return;

    if (!pyodide) {
        setCodeOutput("Initializing Python compiler... Please wait a moment.");
        return;
    }

    setIsRunningCode(true);
    setCodeOutput("Running...");
    
    try {
        let logs = "";
        // Capture stdout
        pyodide.setStdout({ batched: (text: string) => { logs += text + "\n"; } });
        // Capture stderr
        pyodide.setStderr({ batched: (text: string) => { logs += text + "\n"; } });

        await pyodide.runPythonAsync(codeOrNotes);
        
        setCodeOutput(logs || "Code executed successfully (no output printed).");
    } catch (err: any) {
        setCodeOutput(`Traceback (most recent call last):\n${err.message || String(err)}`);
    } finally {
        setIsRunningCode(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = "    "; // 4 spaces
      
      const newValue = codeOrNotes.substring(0, start) + spaces + codeOrNotes.substring(end);
      setCodeOrNotes(newValue);
      
      // Restore cursor position
      setTimeout(() => {
          if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + spaces.length;
          }
      }, 0);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-accent font-bold text-lg tracking-wide">{type.replace('_', ' ')} MOCK</span>
                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-0.5 rounded-full">Gemini 2.5 Flash</span>
            </div>
            
            <div className="flex items-center gap-2 text-slate-300 bg-slate-900/50 px-3 py-1 rounded-md border border-slate-700 font-mono text-sm ml-4">
                <Clock size={14} className="text-accent" />
                <span>{formatTime(elapsedTime)}</span>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
             <button
                onClick={() => {
                    const newState = !isSoundEnabled;
                    setIsSoundEnabled(newState);
                    if (!newState) window.speechSynthesis.cancel();
                }}
                className={`p-2 rounded-lg transition-colors ${isSoundEnabled ? 'text-accent bg-accent/10' : 'text-slate-400 hover:text-white'}`}
                title={isSoundEnabled ? "Mute Interviewer" : "Enable Voice Output"}
             >
                 {isSoundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
             </button>
            <button 
              onClick={() => {
                  window.speechSynthesis.cancel();
                  onEndInterview();
              }}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Square size={16} fill="currentColor" />
              End Session
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Chat Panel */}
        <div className={`flex flex-col ${showEditor ? 'w-1/2 border-r border-slate-700' : 'w-full max-w-4xl mx-auto border-x border-slate-800'}`}>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}
                >
                  <div className="prose prose-invert prose-sm max-w-none break-words">
                    <ReactMarkdown 
                      components={{
                          code({node, className, children, ...props}: any) {
                              return (
                                  <code className={`${className} bg-slate-900/50 rounded px-1 py-0.5`} {...props}>
                                      {children}
                                  </code>
                              )
                          }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700">
            <div className="relative flex items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // Auto-resize
                  e.target.style.height = 'auto';
                  const newHeight = Math.min(e.target.scrollHeight, 200);
                  e.target.style.height = newHeight + 'px';
                  // Show scrollbar only if content exceeds max height
                  setShowScrollbar(e.target.scrollHeight > 200);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                    // Reset height
                    if (e.currentTarget) {
                      e.currentTarget.style.height = 'auto';
                      setShowScrollbar(false);
                    }
                  }
                }}
                placeholder={isListening ? "🎤 Listening... Speak now" : "Type your response..."}
                disabled={isSending || isListening}
                className={`w-full bg-slate-900 text-white placeholder-slate-500 rounded-xl pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 border resize-none min-h-[52px] max-h-[200px] ${showScrollbar ? 'pr-28 overflow-y-auto' : 'pr-24 overflow-y-hidden'} ${isListening ? 'border-red-500/50 bg-red-500/5' : 'border-slate-700'}`}
                rows={1}
              />
              
              <div className={`absolute bottom-2 flex items-center gap-1 ${showScrollbar ? 'right-3' : 'right-2'}`}>
                <button
                    onClick={toggleListening}
                    disabled={isSending}
                    className={`p-2 rounded-lg transition-colors ${
                        isListening 
                            ? 'bg-red-500/20 text-red-400 animate-pulse' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title={isListening ? "Stop recording" : "Dictate response"}
                >
                    {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                    onClick={handleSendMessage}
                    disabled={!input.trim() || isSending}
                    className="p-2 bg-primary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
                >
                    {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Editor Panel (Conditional) */}
        {showEditor && (
          <div className="w-1/2 flex flex-col bg-slate-950">
            <div className="h-10 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 shrink-0">
               <div className="text-xs font-mono text-slate-400 select-none">
                  {isTechnical ? 'solution.py' : 'design_notes.md'}
               </div>
               
               {/* Run Code Button (Technical Only) */}
               {isTechnical && (
                   <button 
                     onClick={handleRunCode}
                     disabled={isRunningCode || !codeOrNotes.trim()}
                     className="flex items-center gap-2 text-xs font-semibold bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       {isRunningCode || isPyodideLoading ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} fill="currentColor" />}
                       {isPyodideLoading ? "Loading Compiler..." : isRunningCode ? "Running..." : "Run Code"}
                   </button>
               )}
            </div>

            <textarea
              ref={textareaRef}
              value={codeOrNotes}
              onChange={(e) => setCodeOrNotes(e.target.value)}
              onKeyDown={handleEditorKeyDown}
              className={`w-full bg-slate-950 text-slate-300 font-mono text-sm p-4 resize-none focus:outline-none leading-6 ${codeOutput !== null ? 'h-[60%]' : 'flex-1'}`}
              style={{ fontVariantLigatures: 'none' }}
              placeholder={isTechnical ? "# Write your Python solution here...\n# Press 'Run Code' to execute." : "# System Design Notes\n\n- Requirements:\n- High Level Design:\n- DB Choice:"}
              spellCheck={false}
            />

            {/* Console Output (Technical Only) */}
            {isTechnical && codeOutput !== null && (
                <div className="h-[40%] bg-slate-900 border-t border-slate-700 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/50">
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <Terminal size={12} />
                            <span>Console Output</span>
                        </div>
                        <button 
                            onClick={() => setCodeOutput(null)}
                            className="text-slate-500 hover:text-white transition-colors"
                            title="Close Console"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    <pre className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-auto whitespace-pre-wrap" style={{ fontVariantLigatures: 'none' }}>
                        {codeOutput}
                    </pre>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;