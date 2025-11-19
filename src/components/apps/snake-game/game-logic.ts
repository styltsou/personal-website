/**
 * Game logic functions for Snake game
 */

import type { GameState, Position } from './types';
import { Direction } from './types';
import { GRID_SIZE, INITIAL_SNAKE } from './constants';

/**
 * Generate a random food position that doesn't overlap with the snake
 * Returns null if the grid is completely filled (snake won the game)
 */
export function generateFood(snake: Position[]): Position | null {
  const maxAttempts = GRID_SIZE * GRID_SIZE;
  let attempts = 0;
  let food: Position;

  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
    // Safety check to prevent infinite loop
    if (attempts > maxAttempts) {
      return null;
    }
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));

  return food;
}

/**
 * Check if the snake has collided with walls or itself
 */
export function checkCollisions(snake: Position[]): boolean {
  const head = snake[0];

  // Check wall collision
  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    return true;
  }

  // Check self collision (head collides with body)
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      return true;
    }
  }

  return false;
}

/**
 * Check if the snake head has collided with food
 */
export function checkFoodCollision(snake: Position[], food: Position): boolean {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
}

/**
 * Move the snake based on current direction
 */
export function moveSnake(snake: Position[], direction: Direction): Position[] {
  const head = { ...snake[0] };

  // Calculate new head position based on direction
  switch (direction) {
    case Direction.Up:
      head.y -= 1;
      break;
    case Direction.Down:
      head.y += 1;
      break;
    case Direction.Left:
      head.x -= 1;
      break;
    case Direction.Right:
      head.x += 1;
      break;
  }

  // Create new snake array with new head
  const newSnake = [head, ...snake];

  // Remove tail (unless food was eaten, handled in updateGameState)
  return newSnake;
}

/**
 * Check if direction change is valid (can't reverse into itself)
 */
export function isValidDirectionChange(
  currentDirection: Direction,
  newDirection: Direction
): boolean {
  // Prevent reversing direction
  if (
    (currentDirection === Direction.Up && newDirection === Direction.Down) ||
    (currentDirection === Direction.Down && newDirection === Direction.Up) ||
    (currentDirection === Direction.Left && newDirection === Direction.Right) ||
    (currentDirection === Direction.Right && newDirection === Direction.Left)
  ) {
    return false;
  }
  return true;
}

/**
 * Update game state for one frame
 */
export function updateGameState(currentState: GameState): GameState {
  // Apply next direction if valid
  let direction = currentState.direction;
  if (
    currentState.nextDirection !== currentState.direction &&
    isValidDirectionChange(currentState.direction, currentState.nextDirection)
  ) {
    direction = currentState.nextDirection;
  }

  // Move snake
  let newSnake = moveSnake(currentState.snake, direction);

  // Check food collision
  const ateFood = checkFoodCollision(newSnake, currentState.food);
  if (!ateFood) {
    // Remove tail if food wasn't eaten
    newSnake = newSnake.slice(0, -1);
  }

  // Update score
  const newScore = ateFood ? currentState.score + 1 : currentState.score;

  // Generate new food if food was eaten
  let newFood = currentState.food;
  if (ateFood) {
    const generatedFood = generateFood(newSnake);
    if (generatedFood === null) {
      // Grid is full - player won! Treat as game over
      return {
        ...currentState,
        snake: newSnake,
        direction,
        nextDirection: direction,
        score: newScore,
        gameOver: true,
      };
    }
    newFood = generatedFood;
  }

  // Check collisions
  const gameOver = checkCollisions(newSnake);

  return {
    ...currentState,
    snake: newSnake,
    food: newFood,
    direction,
    nextDirection: direction, // Sync nextDirection with direction after move
    score: newScore,
    gameOver: gameOver || currentState.gameOver,
  };
}

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  const food = generateFood(INITIAL_SNAKE);
  if (food === null) {
    throw new Error('Failed to generate initial food position');
  }

  return {
    snake: [...INITIAL_SNAKE],
    food,
    direction: Direction.Right,
    nextDirection: Direction.Right,
    score: 0,
    gameOver: false,
    started: false,
    paused: false,
  };
}
