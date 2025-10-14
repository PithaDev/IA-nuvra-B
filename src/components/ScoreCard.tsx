import { useEffect, useState } from 'react';

interface ScoreCardProps {
  title: string;
  value: number;
  icon: string;
  delay?: number;
}

export default function ScoreCard({ title, value, icon, delay = 0 }: ScoreCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = value / 30;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(interval);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, 20);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const getColor = () => {
    if (value >= 80) return 'from-green-400 to-emerald-600';
    if (value >= 60) return 'from-blue-400 to-cyan-600';
    return 'from-orange-400 to-red-600';
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-2xl">{icon}</span>
        <div className={`text-4xl font-bold bg-gradient-to-r ${getColor()} bg-clip-text text-transparent`}>
          {displayValue}
        </div>
      </div>
      <h3 className="text-gray-300 text-sm font-medium">{title}</h3>
      <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${displayValue}%` }}
        />
      </div>
    </div>
  );
}
