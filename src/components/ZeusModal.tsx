import { Button } from './ui/button';
import { ZEUS_QUOTES } from '../constants';
import { useEffect, useState } from 'react';
import { CloudLightning } from 'lucide-react';

interface ZeusModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  cost: number;
}

export default function ZeusModal({ onConfirm, onCancel, cost }: ZeusModalProps) {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(ZEUS_QUOTES[Math.floor(Math.random() * ZEUS_QUOTES.length)]);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-stone-900 border-2 border-amber-600/50 rounded-sm max-w-lg w-full overflow-hidden shadow-[0_0_50px_rgba(180,83,9,0.2)] relative">
        {/* Corner Ornaments */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500 m-1"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500 m-1"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500 m-1"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500 m-1"></div>

        <div className="bg-gradient-to-r from-amber-900/40 via-stone-900 to-amber-900/40 p-5 border-b border-amber-900/50 flex items-center justify-center gap-3">
          <CloudLightning className="text-amber-500 w-8 h-8" />
          <h2 className="text-2xl font-serif font-bold text-amber-500 tracking-widest uppercase">Decreto do Olimpo</h2>
          <CloudLightning className="text-amber-500 w-8 h-8" />
        </div>
        
        <div className="p-8 space-y-8">
          <div className="bg-stone-950/80 p-6 rounded-sm border border-stone-800 relative shadow-inner">
            <p className="text-stone-200 font-serif italic text-xl leading-relaxed text-center">
              "{quote}"
            </p>
            <p className="text-right text-amber-700/80 font-serif mt-4 font-bold tracking-widest">— ZEUS, CEO</p>
          </div>
          
          <div className="flex items-center justify-between text-lg bg-stone-950 p-4 border border-amber-900/30">
            <span className="text-stone-400 font-serif uppercase tracking-wider">Custo do Upgrade:</span>
            <span className="text-amber-500 font-bold font-serif">{cost} Óbolos</span>
          </div>

          <div className="flex gap-4 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 font-serif uppercase tracking-wider h-12 border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200">
              Recusar
            </Button>
            <Button onClick={onConfirm} className="flex-1 bg-amber-800 hover:bg-amber-700 text-stone-100 font-serif uppercase tracking-wider h-12 border border-amber-600/50 shadow-[0_0_15px_rgba(180,83,9,0.3)]">
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
