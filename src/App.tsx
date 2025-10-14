import { useState } from 'react';
import { MessageSquare, Loader2, Sparkles, User, LogOut } from 'lucide-react';
import ScoreCard from './components/ScoreCard';
import SuggestionItem from './components/SuggestionItem';
import OptimizedText from './components/OptimizedText';
import ChatSidebar from './components/ChatSidebar';
import FloatingButtons from './components/FloatingButtons';
import RegistrationForm from './components/RegistrationForm';
import UpgradeModal from './components/UpgradeModal';
import { useUser } from './context/UserContext';
import { AIResponse } from './types';
import { analyzeWithAI } from './utils/aiService';

function App() {
  const { user, loading: userLoading, register, checkUsageLimit, logUsage, remainingUses, logout } = useUser();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResponse | string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim() || loading || !user) return;

    if (!checkUsageLimit()) {
      setUpgradeModalOpen(true);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await analyzeWithAI(input);
      setResult(response);

      const analysisType = typeof response === 'string' &&
        (response.includes('Código') || response.includes('função'))
        ? 'code'
        : 'marketing';

      await logUsage(input, analysisType);
    } catch (error) {
      console.error('Erro ao analisar:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAIResponse = (result: any): result is AIResponse => {
    return result && typeof result === 'object' && 'score' in result;
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0B0F] via-[#1a1b2e] to-[#0A0B0F] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <RegistrationForm onRegister={register} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0B0F] via-[#1a1b2e] to-[#0A0B0F] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo copy.png"
              alt="Nuvra AI Logo"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Nuvra AI
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
              <User className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">{user.name}</span>
            </div>
            <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30">
              <span className="text-white text-sm font-semibold">
                {remainingUses === Infinity ? '∞' : remainingUses} análises restantes
              </span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-300"
              title="Sair"
            >
              <LogOut className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="text-center mb-12 animate-fade-in">
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Especialista em marketing digital, estratégia, tecnologia e programação full stack.
            Transforme seus textos e códigos com inteligência artificial.
          </p>
        </div>

        <div className="mb-8 animate-fade-in">
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite ou cole seu texto de marketing ou código..."
              className="w-full h-48 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 transition-all duration-300 resize-none"
              disabled={loading}
            />
            {!input && (
              <div className="absolute top-4 right-4 text-gray-600 text-sm animate-blink">
                ✨
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !input.trim()}
            className="mt-4 w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analisar com IA
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-8 animate-fade-in">
            {isAIResponse(result) ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <ScoreCard title="Score Geral" value={result.score} icon="📊" delay={0} />
                  <ScoreCard title="Engajamento" value={result.engagement} icon="🎯" delay={100} />
                  <ScoreCard title="Conversão" value={result.conversion} icon="💰" delay={200} />
                </div>

                <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>💡</span>
                    Sugestões de Melhoria
                  </h3>
                  <div className="space-y-4">
                    {result.suggestions.map((suggestion, index) => (
                      <SuggestionItem key={index} suggestion={suggestion} index={index} />
                    ))}
                  </div>
                </div>

                <OptimizedText text={result.optimized_text} />
              </>
            ) : (
              <div className="rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10">
                <div className="prose prose-invert max-w-none">
                  <pre className="text-gray-200 whitespace-pre-wrap leading-relaxed">{result}</pre>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-40"
          aria-label="Abrir chat"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>

        <FloatingButtons />
        <ChatSidebar isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          usedCount={user?.total_uses || 0}
        />
      </div>

      <footer className="relative z-10 text-center py-8 text-gray-400 text-sm">
        <p>
          Desenvolvido com 💙 por{' '}
          <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold">
            Nuvra Solutions
          </span>
        </p>
      </footer>
    </div>
  );
}

export default App;
