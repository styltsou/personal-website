/**
 * Snake Game Window Component
 * Classic Snake game with arrow key controls
 * Canvas-based implementation for optimal performance
 */

export { SnakeIcon } from './icon';

import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/utils/cn';
import styles from './styles.module.scss';
import type { GameState } from './types';
import { Direction } from './types';
import { GAME_SPEED } from './constants';
import {
  createInitialState,
  updateGameState,
  isValidDirectionChange,
} from './game-logic';
import { draw } from './drawing';
import { useDarkTheme } from './hooks/useDarkTheme';
import { useGameSize } from './hooks/useGameSize';

const HIGH_SCORE_KEY = 'snake-high-score';

export default function SnakeWindow() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScore] = useState<number>(0);

  const isDarkTheme = useDarkTheme();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameSize = useGameSize(containerRef, canvasRef);

  const gameLoopRef = useRef<number | undefined>(undefined);
  const gameIntervalRef = useRef<number | undefined>(undefined);
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

  // Game loop - updates state at fixed intervals
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!gameState.started || gameState.gameOver) {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
        gameIntervalRef.current = undefined;
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Game update interval (only when not paused)
    gameIntervalRef.current = window.setInterval(() => {
      const currentState = gameStateRef.current;
      // Don't update game state if paused
      if (currentState.paused) {
        return;
      }
      const newState = updateGameState(currentState);
      gameStateRef.current = newState;
      setGameState(newState);
    }, GAME_SPEED);

    // Animation loop for drawing
    const animate = () => {
      const currentState = gameStateRef.current;
      const currentSize = gameSizeRef.current;
      const currentHighScore =
        currentState.score > highScoreRef.current
          ? currentState.score
          : highScoreRef.current;

      draw(
        ctx,
        currentSize.width,
        currentSize.height,
        currentState,
        isDarkTheme,
        currentHighScore
      );

      // Continue animation even when paused (to show pause overlay)
      if (currentState.started && !currentState.gameOver) {
        gameLoopRef.current = requestAnimationFrame(animate);
      }
    };

    gameLoopRef.current = requestAnimationFrame(animate);

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.started, gameState.gameOver, gameState.paused, isDarkTheme]);

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

  // Handle direction change (only works during active gameplay)
  const handleDirectionChange = useCallback((newDirection: Direction) => {
    const currentState = gameStateRef.current;

    // Only allow direction changes when game is started, not paused, and not over
    if (!currentState.started || currentState.paused || currentState.gameOver) {
      return;
    }

    // Update direction if valid
    if (isValidDirectionChange(currentState.direction, newDirection)) {
      const newState = {
        ...gameStateRef.current,
        nextDirection: newDirection,
      };
      setGameState(newState);
      gameStateRef.current = newState;
    }
  }, []);

  // Handle pause/resume toggle and game start
  const handlePauseToggle = useCallback(() => {
    const currentState = gameStateRef.current;
    
    // If game hasn't started, start it
    if (!currentState.started) {
      const newState = { ...currentState, started: true, paused: false };
      setGameState(newState);
      gameStateRef.current = newState;
      return;
    }

    // If game is over, restart it
    if (currentState.gameOver) {
      const initialState = createInitialState();
      const newState = { ...initialState, started: true, paused: false };
      setGameState(newState);
      gameStateRef.current = newState;
      return;
    }

    // Otherwise, toggle pause
    const newState = {
      ...currentState,
      paused: !currentState.paused,
    };
    setGameState(newState);
    gameStateRef.current = newState;
  }, []);

  // Keyboard event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleDirectionChange(Direction.Up);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleDirectionChange(Direction.Down);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleDirectionChange(Direction.Left);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleDirectionChange(Direction.Right);
          break;
        case ' ':
          e.preventDefault();
          handlePauseToggle();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDirectionChange, handlePauseToggle]);

  return (
    <div className={cn('snake-window', styles.game)}>
      <div className={styles.gameContainer}>
        <div
          ref={containerRef}
          className={styles.gameArea}
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
