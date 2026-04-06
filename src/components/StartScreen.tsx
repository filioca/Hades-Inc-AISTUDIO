import { Button } from './ui/button';
import { ScrollText } from 'lucide-react';

interface StartScreenProps {
  onStart: () => void;
}

export default function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 to-stone-950 p-4">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-600 blur-3xl opacity-20 rounded-full"></div>
            <ScrollText className="w-24 h-24 text-amber-500 relative z-10 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-widest text-stone-100 uppercase drop-shadow-lg">
            OLIMPO S.A. <span className="text-amber-600">—</span> SUBSIDIÁRIA INFERNAL
          </h1>
        </div>

        <div className="bg-stone-900/80 border-y-2 border-amber-900/50 p-8 text-left space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-700/50 opacity-50"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-700/50 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-700/50 opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-700/50 opacity-50"></div>
          
          <p className="text-stone-300 text-lg leading-relaxed font-serif">
            Bem-vindo ao seu primeiro dia como Gerente Operacional do Submundo.
          </p>
          <p className="text-stone-300 text-lg leading-relaxed font-serif">
            Você assumiu uma operação com 3.000 anos de histórico, zero de orçamento e 100% de culpa quando algo falha em qualquer outra divisão.
          </p>
          <p className="text-stone-300 text-lg leading-relaxed font-serif">
            Construa estruturas de contenção. O Olimpo as chama de "projetos sociais" porque soa melhor nos relatórios de sustentabilidade que o Apolo escreve e ninguém lê.
          </p>
          <p className="text-stone-300 text-lg leading-relaxed font-serif">
            Quando uma alma escapar — e vai escapar — a Hera vai te mandar um Formulário de Não-Conformidade Infernal com prazo de resposta de 30 dias úteis. O Zeus vai dizer que é problema de gestão. O Poseidon vai dizer que concordou com você em 340 a.C. e ninguém ouviu.
          </p>
          <p className="text-stone-300 text-lg leading-relaxed font-serif">
            O Hermes já documentou tudo.
          </p>
        </div>

        <Button onClick={onStart} size="lg" className="w-full text-xl h-16 bg-amber-800 hover:bg-amber-700 text-stone-100 font-serif tracking-wider uppercase border border-amber-600/50 shadow-[0_0_20px_rgba(180,83,9,0.3)] transition-all hover:shadow-[0_0_30px_rgba(180,83,9,0.5)]">
          Iniciar Expediente
        </Button>
      </div>
    </div>
  );
}
