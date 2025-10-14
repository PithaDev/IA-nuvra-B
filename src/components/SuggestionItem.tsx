import { Lightbulb } from 'lucide-react';
import { Suggestion } from '../types';

interface SuggestionItemProps {
  suggestion: Suggestion;
  index: number;
}

export default function SuggestionItem({ suggestion, index }: SuggestionItemProps) {
  return (
    <div
      className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
      style={{ animation: `fadeIn 0.5s ease-out ${index * 0.1}s both` }}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <Lightbulb className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-white font-semibold mb-1">{suggestion.title}</h4>
        <p className="text-gray-400 text-sm">{suggestion.description}</p>
      </div>
    </div>
  );
}
