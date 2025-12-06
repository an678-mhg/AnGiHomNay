import React from 'react';
import { FoodSuggestion, MapSource } from '../types';
import { MapPin, RefreshCw } from './Icons';

interface ResultViewProps {
  suggestion: FoodSuggestion | null;
  onRetry: () => void;
}

const MarkdownRenderer = ({ content }: { content: string }) => {
  // Simple renderer to handle basic markdown specific to the prompt structure
  // In a real app, use react-markdown
  const lines = content.split('\n');
  
  return (
    <div className="space-y-4 text-slate-700">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith('## ') || line.startsWith('### ') || line.startsWith('**') && line.endsWith('**')) {
           const text = line.replace(/^#+\s/, '').replace(/\*\*/g, '');
           return <h3 key={idx} className="text-xl font-bold text-slate-900 mt-4 mb-2">{text}</h3>;
        }
        // Bullet points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return <li key={idx} className="ml-4 list-disc pl-1">{line.replace(/^[\-\*]\s/, '')}</li>;
        }
        // Bold keys
        if (line.includes(':**')) {
            const parts = line.split(':**');
            return <p key={idx}><span className="font-semibold text-slate-900">{parts[0].replace(/\*\*/g, '')}:</span> {parts[1]}</p>
        }
        // Normal text
        if (line.trim() === '') return <br key={idx} />;
        return <p key={idx} className="leading-relaxed">{line}</p>;
      })}
    </div>
  );
};

export const ResultView: React.FC<ResultViewProps> = ({ suggestion, onRetry }) => {
  if (!suggestion) return null;

  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
      <div className="bg-orange-500 p-6 sm:p-8 text-white">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Đề xuất cho bạn 🥘</h2>
        <p className="opacity-90">Dựa trên thời tiết và vị trí hiện tại</p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="prose prose-slate max-w-none">
          <MarkdownRenderer content={suggestion.text} />
        </div>

        {suggestion.mapSources.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Link tham khảo
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggestion.mapSources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-3 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-100 hover:border-orange-200 transition-colors group"
                >
                  <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-orange-700 truncate">
                    {source.title}
                  </span>
                  <span className="text-slate-400 group-hover:text-orange-500">
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-slate-50 p-4 flex justify-center border-t border-slate-100">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-600 font-medium hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          Chọn món khác
        </button>
      </div>
    </div>
  );
};
