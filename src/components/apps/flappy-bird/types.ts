/**
 * TypeScript types and interfaces for Flappy Bird game
 */

export interface Pipe {
  x: number;
  topHeight: number;
  gap: number;
}

export interface GameState {
  birdY: number;
  birdVelocity: number;
  pipes: Pipe[];
  score: number;
  gameOver: boolean;
  started: boolean;
}

export interface GameSize {
  width: number;
  height: number;
}

