/**
 * TypeScript types and interfaces for Snake game
 */

export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT',
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  gameOver: boolean;
  started: boolean;
  paused: boolean;
}

export interface GameSize {
  width: number;
  height: number;
}
