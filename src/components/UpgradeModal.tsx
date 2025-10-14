import { X, Sparkles, CheckCircle, MessageCircle } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  usedCount: number;
}

export default function UpgradeModal({ isOpen, onClose, usedCount }: UpgradeModalProps) {
  if (!isOpen) return null;

  const handleContactNuvra = () => {
    const message = encodeURIComponent(
      'Olá! Gostaria de saber mais sobre os planos da Nuvra AI e como posso continuar usando a plataforma.'
    );
    const whatsappUrl = `https://wa.me/5511999999999?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg bg-gradient-to-br from-[#1a1b2e] to-[#0A0B0F] rounded-2xl border border-white/10 shadow-2xl shadow-purple-500/20 p-8 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Você atingiu o limite gratuito!
          </h2>
          <p className="text-gray-300">
            Parabéns! Você já usou suas <span className="text-blue-400 font-semibold">{usedCount} análises gratuitas</span>.
          </p>
        </div>

        <div className="bg-white/5 rounded-xl p-6 mb-6 border border-white/10">
          <h3 className="text-xl font-semibold text-white mb-4">
            Continue aproveitando a Nuvra AI
          </h3>
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Análises ilimitadas com nossa IA avançada
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Consultoria personalizada de marketing e tecnologia
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Suporte prioritário da equipe Nuvra
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-gray-300 text-sm">
                Desenvolvimento de soluções sob medida
              </p>
            </div>
          </div>

          <button
            onClick={handleContactNuvra}
            className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Falar com a Nuvra no WhatsApp
          </button>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-4">
            Escolha um plano que se encaixe nas suas necessidades
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 mb-1">Assinatura Mensal</p>
              <p className="text-white font-semibold text-lg">A partir de R$ 99</p>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-blue-500/30">
              <p className="text-gray-400 mb-1">Cliente Nuvra</p>
              <p className="text-blue-400 font-semibold text-lg">Acesso Ilimitado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
