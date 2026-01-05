import { playCountdownSound } from '@/lib/sound';
import { useEffect } from 'react';

interface QuizCountdownProps {
  countdown: number;
}

export function QuizCountdown({ countdown }: QuizCountdownProps) {
  // Play countdown sound during countdown before quiz begins
  useEffect(() => {
    playCountdownSound();
  }, [countdown]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-[180px] font-black text-white mb-8 animate-bounce drop-shadow-2xl">{countdown}</div>
        <p className="text-4xl text-white font-semibold animate-pulse">Bersedia... 🚀</p>
      </div>
    </div>
  );
}
