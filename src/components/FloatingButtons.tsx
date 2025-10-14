import { MessageCircle, Instagram } from 'lucide-react';

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
      <a
        href="https://wa.me/5575931993242"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 group"
        aria-label="WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
      </a>
      <a
        href="https://instagram.com/nuvrasolutions"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 group"
        aria-label="Instagram"
      >
        <Instagram className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
      </a>
    </div>
  );
}
