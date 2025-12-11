import React from 'react';
import { StoredSession } from '../types';
import { Calendar, Eye, Trash2, Home, Code, Users, Layout } from './Icons';
import { deleteSession } from '../services/storage';

interface HistoryViewProps {
  sessions: StoredSession[];
  onSelectSession: (session: StoredSession) => void;
  onDeleteSession: (id: string) => void;
  onHome: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onSelectSession, onDeleteSession, onHome }) => {
  
  const getSessionTitle = (session: StoredSession): string => {
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

  const getIcon = (type: string) => {
    switch(type) {
      case 'TECHNICAL': return <Code size={20} className="text-accent" />;
      case 'BEHAVIORAL': return <Users size={20} className="text-primary" />;
      case 'SYSTEM_DESIGN': return <Layout size={20} className="text-purple-400" />;
      default: return <Code size={20} />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Interview History</h1>
          <button 
            onClick={onHome}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <Home size={16} />
            Back to Home
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/50 rounded-2xl border border-slate-800">
            <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300">No interviews recorded yet</h3>
            <p className="text-slate-500 mt-2">Complete an interview session to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="bg-slate-800 rounded-xl p-5 flex items-center gap-4 border border-slate-700 hover:border-slate-500 transition-all shadow-sm">
                <div className="p-3 bg-slate-900 rounded-lg">
                  {getIcon(session.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-slate-200 truncate">
                        {getSessionTitle(session)}
                    </h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(session.timestamp).toLocaleDateString()} • {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 truncate max-w-lg">{session.feedback.summary}</p>
                </div>

                <div className={`px-3 py-1 rounded text-sm font-bold border ${getScoreColor(session.feedback.score)}`}>
                    {session.feedback.score}
                </div>

                <div className="flex items-center gap-2 border-l border-slate-700 pl-4 ml-2">
                    <button 
                        onClick={() => onSelectSession(session)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Details"
                    >
                        <Eye size={18} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete Record"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
