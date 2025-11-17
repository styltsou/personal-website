/**
 * Flappy Bird Game Window Component
 * Classic Flappy Bird game with spacebar controls
 * Canvas-based implementation for optimal performance
 */

export { FlappyBirdIcon } from './icon';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';
import type { GameState } from './types';
import { JUMP_STRENGTH } from './constants';
import { generateInitialPipes, updateGameState } from './game-logic';
import { draw } from './drawing';
import { useDarkTheme } from './hooks/useDarkTheme';
import { useGameSize } from './hooks/useGameSize';

const HIGH_SCORE_KEY = 'flappy-bird-high-score';

export default function FlappyBirdWindow() {
  const [gameState, setGameState] = useState<GameState>({
    birdY: 200,
    birdVelocity: 0,
    pipes: [],
    score: 0,
    gameOver: false,
    started: false,
  });

  const [highScore, setHighScore] = useState<number>(0);

  const isDarkTheme = useDarkTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameSize = useGameSize(containerRef, canvasRef);

  const gameLoopRef = useRef<number | undefined>(undefined);
  const gameStateRef = useRef<GameState>(gameState);
  const gameSizeRef = useRef(gameSize);
  const highScoreRef = useRef<number>(0);

  // Load high score from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedHighScore = localStorage.getItem(HIGH_SCORE_KEY);
      if (savedHighScore !== null) {
        const parsed = parseInt(savedHighScore, 10);
        if (!isNaN(parsed)) {
          setHighScore(parsed);
          highScoreRef.current = parsed;
        }
      }
    } catch (error) {
      console.error('Failed to load high score from localStorage:', error);
    }
  }, []);

  // Update high score when game ends
  useEffect(() => {
    if (gameState.gameOver && gameState.score > highScoreRef.current) {
      const newHighScore = gameState.score;
      setHighScore(newHighScore);
      highScoreRef.current = newHighScore;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
        }
      } catch (error) {
        console.error('Failed to save high score to localStorage:', error);
      }
    }
  }, [gameState.gameOver, gameState.score]);

  // Keep highScoreRef in sync with highScore state
  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  // Keep refs in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    gameSizeRef.current = gameSize;
  }, [gameSize]);

  // Reset bird position when size changes
  useEffect(() => {
    setGameState(prev => ({
      ...prev,
      birdY: gameSize.height / 2,
    }));
  }, [gameSize.height]);

  // Initialize pipes when game starts
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!gameState.started || gameState.gameOver) return;
    if (gameState.pipes.length > 0) return; // Don't reinitialize if pipes already exist

    const initialPipes = generateInitialPipes(gameSize);
    setGameState(prev => {
      const newState = {
        ...prev,
        pipes: initialPipes,
      };
      // Update ref immediately
      gameStateRef.current = newState;
      return newState;
    });
  }, [gameState.started, gameState.gameOver, gameState.pipes.length, gameSize]);

  // Game loop - updates state and draws directly
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!gameState.started || gameState.gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      // Use refs to get latest state (avoids stale closures)
      const currentState = gameStateRef.current;
      const currentSize = gameSizeRef.current;

      // Update game state
      const newState = updateGameState(currentState, currentSize);

      // Update ref immediately
      gameStateRef.current = newState;

      // Update React state (for UI updates outside game loop)
      setGameState(newState);

      // Draw directly without waiting for React state update
      // Use ref to get latest high score (avoids stale closures)
      const currentHighScore =
        newState.score > highScoreRef.current
          ? newState.score
          : highScoreRef.current;
      draw(
        ctx,
        currentSize.width,
        currentSize.height,
        newState,
        isDarkTheme,
        currentHighScore
      );

      if (!newState.gameOver) {
        gameLoopRef.current = requestAnimationFrame(gameLoop);
      }
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.started, gameState.gameOver, isDarkTheme]);

  // Rendering effect - draws on canvas whenever state or size changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Show the maximum of current score and high score on game over screen
    const displayHighScore = gameState.gameOver
      ? Math.max(gameState.score, highScore)
      : highScore;
    draw(
      ctx,
      gameSize.width,
      gameSize.height,
      gameState,
      isDarkTheme,
      displayHighScore
    );
  }, [gameState, gameSize, isDarkTheme, highScore]);

  // Handle jump/spacebar
  const handleJump = useCallback(() => {
    if (gameState.gameOver) {
      // Reset game
      setGameState({
        birdY: gameSize.height / 2,
        birdVelocity: 0,
        pipes: [],
        score: 0,
        gameOver: false,
        started: false,
      });
      return;
    }

    if (!gameState.started) {
      setGameState(prev => ({ ...prev, started: true }));
    }

    setGameState(prev => ({
      ...prev,
      birdVelocity: JUMP_STRENGTH,
    }));
  }, [gameState.gameOver, gameState.started, gameSize.height]);

  // Keyboard event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  return (
    <div className={cn('flappy-bird-window', styles.game)}>
      <div className={styles.gameContainer}>
        <div
          ref={containerRef}
          className={styles.gameArea}
          onClick={handleJump}
          style={{ width: '100%', height: '100%' }}
        >
          <canvas
            ref={canvasRef}
            className={styles.canvas}
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      </div>
    </div>
  );
}
