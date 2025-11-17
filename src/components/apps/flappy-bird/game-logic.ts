/**
 * Game logic functions for Flappy Bird
 */

import type { Pipe, GameState, GameSize } from './types';
import {
  GRAVITY,
  PIPE_SPEED,
  PIPE_WIDTH,
  PIPE_SPACING,
  BIRD_SIZE,
  GAP_SIZE,
} from './constants';

/**
 * Generate initial pipes for the game
 */
export function generateInitialPipes(size: GameSize): Pipe[] {
  const initialPipes: Pipe[] = [];
  const startX = size.width * 0.5;
  const groundHeight = size.height * 0.1;
  const minTopHeight = 80;
  const maxTopHeight = size.height - groundHeight - GAP_SIZE - 80;

  for (let i = 0; i < 3; i++) {
    const topHeight =
      Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;
    initialPipes.push({
      x: startX + i * PIPE_SPACING,
      topHeight: topHeight,
      gap: GAP_SIZE,
    });
  }

  return initialPipes;
}

/**
 * Update bird position based on physics
 */
export function updateBird(
  birdY: number,
  birdVelocity: number,
  size: GameSize
): { newY: number; newVelocity: number; gameOver: boolean } {
  const newVelocity = birdVelocity + GRAVITY;
  let newY = birdY + newVelocity;
  const groundHeight = size.height * 0.1;
  const groundTop = size.height - groundHeight;

  let gameOver = false;

  if (newY < 0) {
    newY = 0;
    return { newY, newVelocity: 0, gameOver };
  }

  if (newY + BIRD_SIZE > groundTop) {
    gameOver = true;
  }

  return { newY, newVelocity, gameOver };
}

/**
 * Update pipes position and generate new ones
 */
export function updatePipes(
  pipes: Pipe[],
  size: GameSize,
  gameOver: boolean
): Pipe[] {
  let newPipes = pipes
    .map(pipe => ({
      ...pipe,
      x: pipe.x - PIPE_SPEED,
    }))
    .filter(pipe => pipe.x + PIPE_WIDTH > 0);

  // If no pipes exist, initialize them
  if (!gameOver && newPipes.length === 0) {
    newPipes = generateInitialPipes(size);
  }

  // Add new pipe with proper bounds
  if (!gameOver && newPipes.length > 0) {
    const lastPipe = newPipes[newPipes.length - 1];
    if (lastPipe.x < size.width - PIPE_SPACING) {
      const groundHeight = size.height * 0.1;
      const minTopHeight = 80;
      const maxTopHeight = size.height - groundHeight - GAP_SIZE - 80;

      newPipes.push({
        x: size.width,
        topHeight: Math.random() * (maxTopHeight - minTopHeight) + minTopHeight,
        gap: GAP_SIZE,
      });
    }
  }

  return newPipes;
}

/**
 * Check if bird collides with any pipe
 */
export function checkCollisions(
  birdY: number,
  pipes: Pipe[],
  size: GameSize
): boolean {
  const birdX = Math.max(100, size.width * 0.15);
  const birdLeft = birdX;
  const birdRight = birdX + BIRD_SIZE;
  const birdTop = birdY;
  const birdBottom = birdY + BIRD_SIZE;

  for (const pipe of pipes) {
    // Check if bird overlaps with pipe horizontally
    if (birdRight > pipe.x && birdLeft < pipe.x + PIPE_WIDTH) {
      // Check if bird is NOT in the gap (hits top or bottom pipe)
      if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + pipe.gap) {
        return true; // Collision detected
      }
    }
  }

  return false;
}

/**
 * Update score based on pipes passed
 */
export function updateScore(
  currentScore: number,
  pipes: Pipe[],
  size: GameSize
): number {
  const scoreBirdX = Math.max(100, size.width * 0.15);
  let newScore = currentScore;

  for (const pipe of pipes) {
    // Check if bird just passed the pipe
    if (
      pipe.x + PIPE_WIDTH < scoreBirdX &&
      pipe.x + PIPE_WIDTH + PIPE_SPEED >= scoreBirdX
    ) {
      newScore++;
    }
  }

  return newScore;
}

/**
 * Update game state for one frame
 */
export function updateGameState(
  currentState: GameState,
  size: GameSize
): GameState {
  // Update bird
  const {
    newY,
    newVelocity,
    gameOver: birdGameOver,
  } = updateBird(currentState.birdY, currentState.birdVelocity, size);

  // Update pipes
  const newPipes = updatePipes(currentState.pipes, size, birdGameOver);

  // Check collisions
  const collisionGameOver =
    birdGameOver || checkCollisions(newY, newPipes, size);

  // Update score
  const newScore = collisionGameOver
    ? currentState.score
    : updateScore(currentState.score, newPipes, size);

  return {
    ...currentState,
    birdY: newY,
    birdVelocity: newVelocity,
    pipes: newPipes,
    score: newScore,
    gameOver: collisionGameOver || currentState.gameOver,
  };
}
