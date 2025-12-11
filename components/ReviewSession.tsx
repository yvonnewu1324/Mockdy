import React, { useState } from 'react';
import { StoredSession } from '../types';
import FeedbackDisplay from './FeedbackDisplay';
import { ArrowLeft, MessageSquare, FileText, BarChart2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ReviewSessionProps {
  session: StoredSession;
  onBack: () => void;
}

const ReviewSession: React.FC<ReviewSessionProps> = ({ session, onBack }) => {
  const [activeTab, setActiveTab] = useState<'feedback' | 'transcript' | 'notes'>('feedback');

  const getSessionTitle = (): string => {
    if (session.type === 'TECHNICAL') {
      if (session.problemInfo) {
        return `Mock Leetcode ${session.problemInfo.id}. ${session.problemInfo.name}`;
      }
      return 'Mock Leetcode';
    } else if (session.type === 'SYSTEM_DESIGN') {
      const firstMessage = session.messages.find(m => m.role === 'model')?.text || '';
      const designMatch = firstMessage.match(/(?:design|Design|build|Build)\s+(?:a\s+)?(?:system\s+for\s+)?["']?([^"'\n]{1,50})["']?/i);
      if (designMatch && designMatch[1].length > 3) {
        const systemName = designMatch[1].trim().charAt(0).toUpperCase() + designMatch[1].trim().slice(1);
        return `Design ${systemName}`;
      }
      return 'Design System';
    } else {
      return 'Mock BQ';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Navbar */}
      <div className="h-16 border-b border-slate-800 flex items-center px-6 bg-slate-900 shrink-0 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mr-6"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
        <div className="h-6 w-px bg-slate-700 mr-6"></div>
        <div>
            <h2 className="font-semibold text-lg">{getSessionTitle()} Review</h2>
            <p className="text-xs text-slate-500">{new Date(session.timestamp).toLocaleString()}</p>
        </div>
        
        {/* Tabs */}
        <div className="ml-auto flex bg-slate-800 rounded-lg p-1">
            <button 
                onClick={() => setActiveTab('feedback')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'feedback' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <BarChart2 size={16} />
                Feedback
            </button>
            <button 
                onClick={() => setActiveTab('transcript')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'transcript' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <MessageSquare size={16} />
                Transcript
            </button>
             <button 
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'notes' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
                <FileText size={16} />
                Code / Notes
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'feedback' && (
             <div className="py-6">
                 {/* Reusing FeedbackDisplay structure but wrapping it or passing props to hide home button if needed. 
                     However, FeedbackDisplay has a specific "Return Home" layout. 
                     We can render it directly or extract it. 
                     To save code, let's just render the FeedbackDisplay but we need to handle the onHome since we are in review mode.
                     Ideally FeedbackDisplay shouldn't have the full page layout if reused.
                     For now, let's just pass a no-op or handle it cleanly.
                  */}
                 <FeedbackDisplay data={session.feedback} onHome={onBack} />
             </div>
        )}

        {activeTab === 'transcript' && (
            <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
                {session.messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <span className="text-xs text-slate-500 mb-1 capitalize">{msg.role}</span>
                            <div 
                                className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
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
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'notes' && (
            <div className="max-w-4xl mx-auto py-8 px-6 h-full flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-slate-300">
                    {session.type === 'TECHNICAL' ? 'Code Solution' : 'Notes / Design'}
                </h3>
                <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 font-mono text-sm text-slate-300 overflow-auto flex-1 min-h-[500px] whitespace-pre-wrap" style={{ fontVariantLigatures: 'none' }}>
                    {session.codeOrNotes || "// No content recorded"}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSession;