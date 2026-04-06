/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { GameState } from './types';
import TitleScreen from './components/TitleScreen';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';

const INITIAL_GAME_STATE: GameState = {
  status: 'start',
  obolos: 200,
  lives: 20,
  wave: 0,
  enemiesKilled: 0,
  enemies: [],
  towers: [],
  projectiles: [],
  waveActive: false,
  waveTimer: 0,
  pendingEnemies: [],
  zeusPenalties: 0,
};

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleStateChange = (newState: GameState) => {
    setGameState(newState);
  };

  const startBriefing = () => {
    setGameState({ ...INITIAL_GAME_STATE, status: 'briefing' });
  };

  const startGame = () => {
    setGameState({ ...INITIAL_GAME_STATE, status: 'playing' });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans selection:bg-amber-900 selection:text-white">
      {!gameState || gameState.status === 'start' ? (
        <TitleScreen onStart={startBriefing} />
      ) : gameState.status === 'briefing' ? (
        <StartScreen onStart={startGame} />
      ) : gameState.status === 'playing' || gameState.status === 'paused' || gameState.status === 'gameover' || gameState.status === 'victory' ? (
        <GameScreen gameState={gameState} onStateChange={handleStateChange} />
      ) : null}
    </div>
  );
}

