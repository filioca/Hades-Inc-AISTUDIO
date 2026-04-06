import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/Engine';
import { GameState, TowerType } from '../types';
import { TOWER_STATS, WAVES } from '../constants';
import { Button } from './ui/button';
import { MessageSquare, FastForward, Play, X, ArrowUpCircle } from 'lucide-react';

const CORPORATE_MESSAGES = [
  { sender: 'Hermes', text: 'Lembrete: A meta de almas processadas aumentou 20% este trimestre.' },
  { sender: 'Atena', text: 'Otimização de rotas implementada. Eficiência subiu 0.4%.' },
  { sender: 'Hades', text: 'Não me decepcionem. O Tártaro tem espaço para funcionários incompetentes.' },
  { sender: 'RH', text: 'A festa da firma foi cancelada devido ao excesso de fugas.' },
  { sender: 'Cérbero', text: '*Sons de mastigação de relatórios*' },
];

const SLOT_IMAGES: Record<TowerType, string> = {
  caronte: 'https://i.imgur.com/RqrDdti.png',
  medusa: 'https://i.imgur.com/l3DGtFx.png',
  cerbero: 'https://i.imgur.com/4lAfQNd.png',
  sisifo: 'https://i.imgur.com/eWTLfnX.png',
};

const TOWER_SPRITES: Record<TowerType, string> = {
  caronte: 'https://i.imgur.com/EqAP9zX.png',
  medusa: 'https://i.imgur.com/HvWCKBR.png',
  cerbero: 'https://i.imgur.com/IzVaDZT.png',
  sisifo: 'https://i.imgur.com/voRGhA4.png',
};

const TypewriterText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [text]);

  return <span className="text-stone-400 italic">{displayedText}</span>;
};

interface GameScreenProps {
  gameState: GameState;
  onStateChange: (state: GameState) => void;
}

export default function GameScreen({ gameState, onStateChange }: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [selectedTowerType, setSelectedTowerType] = useState<TowerType | null>(null);
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [zeusModalOpen, setZeusModalOpen] = useState(false);
  const [upgradeCost, setUpgradeCost] = useState(0);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 1 });
  const prevLivesRef = useRef(20);

  useEffect(() => {
    if (gameState && gameState.lives < prevLivesRef.current) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
    if (gameState) {
      prevLivesRef.current = gameState.lives;
    }
  }, [gameState?.lives]);

  useEffect(() => {
    if (!canvasRef.current) return;

    engineRef.current = new GameEngine(canvasRef.current, (newState) => {
      onStateChange({ ...newState });
    });

    engineRef.current.start((loaded, total) => {
      setLoadingProgress({ loaded, total });
    });

    const tickerInterval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % CORPORATE_MESSAGES.length);
    }, 10000);

    return () => {
      engineRef.current?.stop();
      clearInterval(tickerInterval);
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSelectedTower(selectedTowerId);
    }
  }, [selectedTowerId]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current || gameState?.status !== 'playing') return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const CELL_SIZE = 40;
    // Check if clicked on existing tower
    const clickedTower = gameState.towers?.find(t => 
      Math.abs(t.x - x) < CELL_SIZE / 2 && Math.abs(t.y - y) < CELL_SIZE / 2
    );

    if (clickedTower) {
      setSelectedTowerId(clickedTower.id);
      setSelectedTowerType(null);
      return;
    }

    // Build new tower
    if (selectedTowerType) {
      const gridX = Math.floor(x / CELL_SIZE);
      const gridY = Math.floor(y / CELL_SIZE);
      
      const success = engineRef.current.buildTower(selectedTowerType, gridX, gridY);
      if (success) {
        setSelectedTowerType(null);
      }
    } else {
      setSelectedTowerId(null);
    }
  };

  const handleUpgradeClick = () => {
    if (!selectedTowerId || !engineRef.current || !gameState) return;
    
    const tower = gameState.towers.find(t => t.id === selectedTowerId);
    if (!tower) return;
    
    const stats = TOWER_STATS[tower.type];
    const cost = stats.cost[tower.level];
    
    if (gameState.obolos >= cost) {
      setUpgradeCost(cost);
      setZeusModalOpen(true);
      engineRef.current.pause();
    }
  };

  const handleZeusConfirm = () => {
    if (selectedTowerId && engineRef.current) {
      const success = engineRef.current.upgradeTower(selectedTowerId);
      if (success) {
        // Apply penalty every 3 upgrades
        if (Math.random() < 0.33) {
          engineRef.current.applyZeusPenalty();
        }
      }
    }
    setZeusModalOpen(false);
    setSelectedTowerId(null);
    engineRef.current?.resume();
  };

  const handleZeusCancel = () => {
    setZeusModalOpen(false);
    engineRef.current?.resume();
  };

  const selectedTower = gameState.towers?.find(t => t.id === selectedTowerId);

  return (
    <div className="flex flex-col h-screen bg-stone-950 overflow-hidden">
      {/* Preloader */}
      {loadingProgress.loaded < loadingProgress.total && (
        <div className="fixed inset-0 bg-stone-950 z-50 flex items-center justify-center">
          <div className="text-amber-500 font-serif text-2xl tracking-widest uppercase animate-pulse">
            Aprovando Papelada Divina... ({loadingProgress.loaded}/{loadingProgress.total} Assets Carregados)
          </div>
        </div>
      )}

      {/* HUD Bar */}
      <div 
        className="h-16 flex items-center justify-center shrink-0 shadow-md relative z-10 bg-stone-900 border-b-2 border-amber-900/50"
      >
        <div className="flex items-center justify-between w-full max-w-5xl px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-amber-500 font-bold text-xl font-serif">
              <img src="https://i.imgur.com/ONYTEKF.png" alt="Moedas" className="w-6 h-6 object-contain" />
              <span>{gameState.obolos}</span>
            </div>
            <div className="flex items-center gap-2 text-red-600 font-bold text-xl font-serif">
              <img src="https://i.imgur.com/LP9KhkB.png" alt="Vidas" className="w-6 h-6 object-contain" />
              <span>{gameState.lives}</span>
            </div>
            <div className="flex items-center gap-2 text-stone-400 font-bold text-xl font-serif">
              <img src="https://i.imgur.com/wUqv0Pg.png" alt="Inimigos Mortos" className="w-6 h-6 object-contain" />
              <span>{gameState.enemiesKilled}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-stone-300 font-bold font-serif text-lg tracking-widest uppercase drop-shadow-md">
              Onda {gameState.wave} <span className="text-stone-600">/</span> {WAVES.length}
            </div>
            <button 
              onClick={() => engineRef.current?.startNextWave()} 
              disabled={gameState.waveActive || gameState.wave >= WAVES.length}
              className={`relative w-48 h-12 flex items-center justify-center font-serif uppercase tracking-wider font-bold transition-all duration-300 border-2 rounded-sm ${!gameState.waveActive ? 'hover:scale-105 hover:brightness-110 cursor-pointer text-amber-400 border-amber-500 bg-stone-800 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]' : 'opacity-50 cursor-not-allowed text-stone-400 border-stone-700 bg-stone-900 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]'}`}
              style={{ backgroundImage: 'linear-gradient(to bottom, rgba(28, 25, 23, 0.8), rgba(41, 37, 36, 0.9))' }}
            >
              {gameState.waveActive ? 'Em Progresso' : 'Próxima Onda'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Game Area */}
        <div className={`flex-1 flex flex-col bg-stone-950 overflow-hidden relative ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/50 to-stone-950 pointer-events-none"></div>
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto relative z-10">
            <div className="relative shadow-[0_0_30px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden border-4 border-stone-800" style={{ aspectRatio: '800/600', maxHeight: '100%', maxWidth: '100%' }}>
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onClick={handleCanvasClick}
                className="bg-stone-900 cursor-crosshair w-full h-full object-contain"
              />
            </div>
          </div>
          
          {/* Corporate Ticker */}
          <div 
            className="h-12 flex items-center justify-center shrink-0 overflow-hidden relative z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] bg-stone-900 border-t-2 border-amber-900/50"
          >
            <div className="flex items-center w-full max-w-5xl px-6">
              <div className="flex items-center gap-2 text-amber-600 shrink-0 mr-6">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm font-bold font-serif uppercase tracking-widest">Olimpo S.A.</span>
              </div>
              <div className="flex-1 relative h-full border-l border-stone-700/50 pl-6">
                <div 
                  key={tickerIndex}
                  className="absolute inset-0 flex items-center text-sm"
                >
                  <span className="font-bold font-serif text-stone-300 mr-3 uppercase tracking-wider">{CORPORATE_MESSAGES[tickerIndex].sender}:</span>
                  <TypewriterText text={`"${CORPORATE_MESSAGES[tickerIndex].text}"`} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-stone-900 border-l-2 border-amber-900/50 flex flex-col shrink-0 shadow-[-5px_0_15px_rgba(0,0,0,0.3)] relative z-20 overflow-y-auto">
          <div className="p-5 border-b border-stone-800 bg-stone-950/30 shrink-0">
            <h2 className="text-xl font-serif font-bold text-stone-100 mb-4 uppercase tracking-widest text-center">Projetos Sociais</h2>
            <div className="flex flex-col gap-4">
              {(Object.entries(TOWER_STATS) as [TowerType, any][]).map(([type, stats]) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedTowerType(selectedTowerType === type ? null : type);
                    setSelectedTowerId(null);
                  }}
                  className={`relative flex flex-col items-center p-3 transition-all border-2 rounded-sm bg-stone-950/80 ${
                    selectedTowerType === type 
                      ? 'border-amber-500 scale-[1.02] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                      : 'border-stone-700 hover:border-stone-500 hover:scale-[1.02]'
                  }`}
                  style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(28, 25, 23, 0.8), rgba(41, 37, 36, 0.9))',
                  }}
                >
                  <img src={TOWER_SPRITES[type as TowerType]} alt={type} className="w-full h-24 object-contain drop-shadow-xl mb-2" />
                  <div className="w-full text-center border-t border-stone-700/50 pt-2">
                    <div className="font-bold font-serif text-base text-amber-500 uppercase tracking-wider drop-shadow-sm">{stats.name}</div>
                    <div className="text-sm text-stone-300 font-bold font-sans mt-1">{stats.cost[0]} Óbolos</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 p-5 bg-stone-900/50 shrink-0">
            {selectedTowerType && !selectedTowerId && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-3 border-b border-stone-800 pb-3">
                  <img src={TOWER_SPRITES[selectedTowerType]} alt={selectedTowerType} className="w-12 h-12 object-contain" />
                  <div>
                    <h3 className="font-serif font-bold text-lg text-amber-500 uppercase">{TOWER_STATS[selectedTowerType].name}</h3>
                    <div className="text-sm text-stone-400 font-sans">{TOWER_STATS[selectedTowerType].cost[0]} Óbolos</div>
                  </div>
                </div>
                <p className="text-sm text-stone-300 font-sans leading-relaxed italic border-l-2 border-stone-700 pl-3">
                  "{TOWER_STATS[selectedTowerType].desc}"
                </p>
                <div className="space-y-3 bg-stone-950/50 p-4 rounded-sm border border-stone-800">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-stone-400 uppercase tracking-wider text-xs font-bold">Dano</span>
                    <span className="text-stone-200">{TOWER_STATS[selectedTowerType].damage[0]}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-stone-400 uppercase tracking-wider text-xs font-bold">Alcance</span>
                    <span className="text-stone-200">{TOWER_STATS[selectedTowerType].range[0]}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-stone-400 uppercase tracking-wider text-xs font-bold">Cadência</span>
                    <span className="text-stone-200">{(60 / TOWER_STATS[selectedTowerType].fireRate[0]).toFixed(1)}/s</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTowerId && selectedTower && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={TOWER_SPRITES[selectedTower.type]} alt={selectedTower.type} className="w-12 h-12 object-contain" />
                    <div>
                      <h3 className="font-serif font-bold text-lg text-amber-500 uppercase">{TOWER_STATS[selectedTower.type].name}</h3>
                      <div className="text-xs text-stone-400 font-sans uppercase tracking-widest">Nível {selectedTower.level + 1}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedTowerId(null)}
                    className="text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-3 bg-stone-950/50 p-4 rounded-sm border border-stone-800">
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-stone-400 uppercase tracking-wider text-xs font-bold">Dano</span>
                    <span className="text-stone-200">{TOWER_STATS[selectedTower.type].damage[selectedTower.level]}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-stone-400 uppercase tracking-wider text-xs font-bold">Alcance</span>
                    <span className="text-stone-200">{TOWER_STATS[selectedTower.type].range[selectedTower.level]}</span>
                  </div>
                  <div className="flex justify-between text-sm font-sans">
                    <span className="text-stone-400 uppercase tracking-wider text-xs font-bold">Cadência</span>
                    <span className="text-stone-200">{(60 / TOWER_STATS[selectedTower.type].fireRate[selectedTower.level]).toFixed(1)}/s</span>
                  </div>
                </div>

                {selectedTower.level < 2 && (
                  <Button 
                    className="w-full gap-2 font-serif uppercase tracking-widest bg-amber-800 hover:bg-amber-700 text-stone-100 border border-amber-600/50"
                    onClick={handleUpgradeClick}
                    disabled={gameState.obolos < TOWER_STATS[selectedTower.type].cost[selectedTower.level + 1]}
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    Promover ({TOWER_STATS[selectedTower.type].cost[selectedTower.level + 1]})
                  </Button>
                )}
                {selectedTower.level >= 2 && (
                  <div className="text-center text-sm text-amber-500 font-serif uppercase tracking-widest border border-amber-900/50 bg-amber-950/30 py-2 rounded-sm">
                    Nível Máximo
                  </div>
                )}
              </div>
            )}

            {!selectedTowerType && !selectedTowerId && (
              <div className="h-full flex items-center justify-center text-stone-600 text-sm font-serif uppercase tracking-widest text-center px-4">
                Selecione um projeto para alocar recursos
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zeus Audit Modal */}
      {zeusModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-stone-900 border-2 border-amber-500/50 p-8 max-w-md w-full shadow-[0_0_50px_rgba(245,158,11,0.2)] rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
            <h2 className="text-2xl font-serif font-bold text-amber-500 mb-4 uppercase tracking-widest text-center">Auditoria do Olimpo</h2>
            <p className="text-stone-300 mb-6 font-sans text-center">
              Aprovar esta promoção custará <strong className="text-amber-500">{upgradeCost} Óbolos</strong>. 
              <br/><br/>
              <span className="text-sm text-stone-400 italic">Aviso: O CEO Zeus pode exigir cortes de custos (penalidades) aleatoriamente durante promoções.</span>
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 border-stone-700 text-stone-400 hover:bg-stone-800 hover:text-stone-200 font-serif uppercase tracking-wider" onClick={handleZeusCancel}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-amber-800 hover:bg-amber-700 text-stone-100 font-serif uppercase tracking-wider" onClick={handleZeusConfirm}>
                Assinar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over / Victory Overlay */}
      {(gameState.status === 'gameover' || gameState.status === 'victory') && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="text-center max-w-lg p-8 border-2 border-stone-800 bg-stone-950 shadow-2xl rounded-sm relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-2 ${gameState.status === 'victory' ? 'bg-emerald-600' : 'bg-red-900'}`}></div>
            <h1 className={`text-6xl font-serif font-bold mb-6 uppercase tracking-widest ${gameState.status === 'victory' ? 'text-emerald-500' : 'text-red-700'}`}>
              {gameState.status === 'victory' ? 'Meta Atingida' : 'Demissão'}
            </h1>
            <p className="text-xl text-stone-300 mb-8 font-sans">
              {gameState.status === 'victory' 
                ? 'Olimpo S.A. reconhece sua eficiência. Seu bônus anual foi aprovado.' 
                : 'Muitas almas escaparam. O RH entrará em contato para o desligamento.'}
            </p>
            <div className="grid grid-cols-2 gap-4 mb-8 text-left bg-stone-900 p-6 rounded-sm border border-stone-800">
              <div className="text-stone-400 font-sans uppercase tracking-wider text-sm font-bold">Almas Processadas</div>
              <div className="text-stone-200 font-serif text-xl text-right">{gameState.enemiesKilled}</div>
              <div className="text-stone-400 font-sans uppercase tracking-wider text-sm font-bold">Orçamento Final</div>
              <div className="text-amber-500 font-serif text-xl text-right">{gameState.obolos} Óbolos</div>
              <div className="text-stone-400 font-sans uppercase tracking-wider text-sm font-bold">Auditorias (Zeus)</div>
              <div className="text-stone-200 font-serif text-xl text-right">{gameState.zeusPenalties}</div>
            </div>
            <Button 
              size="lg" 
              onClick={() => window.location.reload()}
              className="w-full font-serif uppercase tracking-widest text-lg h-14 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600"
            >
              Novo Contrato
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
