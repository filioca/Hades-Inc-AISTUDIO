import { Button } from './ui/button';
import { Flame } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 to-stone-950 p-4">
      <div className="max-w-xl w-full space-y-10 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-600 blur-3xl opacity-20 rounded-full"></div>
            <Flame className="w-32 h-32 text-amber-500 relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-serif font-bold tracking-widest text-stone-100 uppercase drop-shadow-lg">
            Hades <span className="text-amber-600">Inc.</span>
          </h1>
          <p className="text-2xl text-amber-700/80 font-serif tracking-widest uppercase" style={{ letterSpacing: '0.2em' }}>
            Tower Defense
          </p>
        </div>

        <div className="bg-stone-900/80 border-y-2 border-amber-900/50 p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-700/50 opacity-50"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-700/50 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-700/50 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-700/50 opacity-50"></div>
          
          <p className="text-stone-300 text-xl leading-relaxed font-serif">
            Bem-vindo ao Submundo.
          </p>
          <p className="text-stone-300 text-xl leading-relaxed font-serif">
            Orçamento: zero. Burocracia: eterna.
          </p>
        </div>

        <Button onClick={onStart} size="lg" className="w-full text-xl h-16 bg-amber-800 hover:bg-amber-700 text-stone-100 font-serif tracking-wider uppercase border border-amber-600/50 shadow-[0_0_20px_rgba(180,83,9,0.3)] transition-all hover:shadow-[0_0_30px_rgba(180,83,9,0.5)]">
          Aperte qualquer botão para bater o ponto
        </Button>
      </div>
    </div>
  );
}
