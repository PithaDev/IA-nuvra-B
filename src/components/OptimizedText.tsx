import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface OptimizedTextProps {
  text: string;
}

export default function OptimizedText({ text }: OptimizedTextProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-6 backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">✨</span>
          Versão Otimizada pela IA
        </h3>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all duration-300 hover:scale-105"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copiado!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copiar
            </>
          )}
        </button>
      </div>
      <p className="text-gray-200 leading-relaxed">{text}</p>
    </div>
  );
}
