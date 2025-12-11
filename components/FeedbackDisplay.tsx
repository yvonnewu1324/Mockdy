import React from 'react';
import { FeedbackData } from '../types';
import { CheckCircle, AlertCircle, RefreshCcw, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FeedbackDisplayProps {
  data: FeedbackData;
  onHome: () => void;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ data, onHome }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
      if (score >= 80) return 'bg-green-500/10 border-green-500/20';
      if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/20';
      return 'bg-red-500/10 border-red-500/20';
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Interview Feedback</h1>
            <button 
                onClick={onHome}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
                <Home size={16} />
                Return Home
            </button>
        </div>

        {/* Score Card */}
        <div className={`p-8 rounded-2xl border flex flex-col items-center justify-center text-center ${getScoreBg(data.score)}`}>
            <span className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-2">Overall Score</span>
            <div className={`text-6xl font-black ${getScoreColor(data.score)} mb-4`}>
                {data.score}
                <span className="text-2xl text-slate-500 font-normal">/100</span>
            </div>
            <p className="text-slate-300 max-w-2xl text-lg leading-relaxed">
                {data.summary}
            </p>
        </div>

        {/* Analysis Grid */}
        <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4 text-green-400">
                    <CheckCircle size={24} />
                    <h3 className="text-xl font-semibold">Strengths</h3>
                </div>
                <ul className="space-y-3">
                    {data.strengths.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"/>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center gap-3 mb-4 text-amber-400">
                    <AlertCircle size={24} />
                    <h3 className="text-xl font-semibold">Areas for Improvement</h3>
                </div>
                <ul className="space-y-3">
                    {data.weaknesses.map((point, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-300">
                             <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"/>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

        {/* Optimal Solution */}
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4">Recommended Approach / Standard Answer</h3>
            <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-x-auto border border-slate-700">
                <ReactMarkdown>{data.optimalSolution}</ReactMarkdown>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
