/**
 * Canvas drawing functions for Snake game
 */

import type { GameState } from './types';
import { COLORS } from './constants';
import { GRID_SIZE } from './constants';
import { getThemeColors } from './utils/get-theme-colors';

/**
 * Calculate cell size based on canvas dimensions
 */
function getCellSize(width: number, height: number): number {
  return Math.min(
    Math.floor(width / GRID_SIZE),
    Math.floor(height / GRID_SIZE)
  );
}

/**
 * Calculate grid offsets to center the grid on the canvas
 */
function getGridOffsets(
  width: number,
  height: number
): { offsetX: number; offsetY: number; cellSize: number; gridWidth: number; gridHeight: number } {
  const cellSize = getCellSize(width, height);
  const gridWidth = cellSize * GRID_SIZE;
  const gridHeight = cellSize * GRID_SIZE;
  const offsetX = (width - gridWidth) / 2;
  const offsetY = (height - gridHeight) / 2;

  return { offsetX, offsetY, cellSize, gridWidth, gridHeight };
}

/**
 * Draw grid background
 */
function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  background: string,
  grid: string
) {
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const { offsetX, offsetY, cellSize, gridWidth, gridHeight } = getGridOffsets(width, height);

  // Draw grid lines
  ctx.strokeStyle = grid;
  ctx.lineWidth = 1;

  for (let i = 0; i <= GRID_SIZE; i++) {
    const x = offsetX + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, offsetY);
    ctx.lineTo(x, offsetY + gridHeight);
    ctx.stroke();

    const y = offsetY + i * cellSize;
    ctx.beginPath();
    ctx.moveTo(offsetX, y);
    ctx.lineTo(offsetX + gridWidth, y);
    ctx.stroke();
  }
}

/**
 * Draw snake
 */
function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Array<{ x: number; y: number }>,
  width: number,
  height: number,
  colors: { snake: string; snakeHead: string }
) {
  const { offsetX, offsetY, cellSize } = getGridOffsets(width, height);

  snake.forEach((segment, index) => {
    const x = offsetX + segment.x * cellSize;
    const y = offsetY + segment.y * cellSize;

    // Head is darker
    ctx.fillStyle = index === 0 ? colors.snakeHead : colors.snake;
    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

    // Add border for retro look
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
  });
}

/**
 * Draw food
 */
function drawFood(
  ctx: CanvasRenderingContext2D,
  food: { x: number; y: number },
  width: number,
  height: number,
  colors: { food: string }
) {
  const { offsetX, offsetY, cellSize } = getGridOffsets(width, height);

  const x = offsetX + food.x * cellSize;
  const y = offsetY + food.y * cellSize;

  // Draw food as a circle for retro look
  ctx.fillStyle = colors.food;
  ctx.beginPath();
  ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
  ctx.fill();

  // Add border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 1;
  ctx.stroke();
}

/**
 * Draw a rounded rectangle (polyfill for older browsers)
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draw a card/box with rounded corners for overlays
 */
function drawCard(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  cardBackground: string,
  cardBorder: string
) {
  const cardX = centerX - width / 2;
  const cardY = centerY - height / 2;
  const borderRadius = 8;

  // Card shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  drawRoundedRect(ctx, cardX + 2, cardY + 2, width, height, borderRadius);
  ctx.fill();

  // Card background
  ctx.fillStyle = cardBackground;
  drawRoundedRect(ctx, cardX, cardY, width, height, borderRadius);
  ctx.fill();

  // Card border
  ctx.strokeStyle = cardBorder;
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, cardX, cardY, width, height, borderRadius);
  ctx.stroke();
}

/**
 * Draw overlay text (start screen, game over, score)
 */
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  text: string,
  cardBackground: string,
  cardBorder: string,
  overlay: string,
  highScore: number
) {
  if (!state.started && !state.gameOver) {
    // Start screen
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    // Draw card
    const cardWidth = 280;
    const cardHeight = highScore > 0 ? 180 : 140;
    drawCard(ctx, width / 2, height / 2, cardWidth, cardHeight, cardBackground, cardBorder);

    ctx.fillStyle = text;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText('SNAKE', width / 2, height / 2 - 50);
    ctx.font = '18px monospace';
    ctx.fillText('Press SPACE to Start', width / 2, height / 2 - 10);
    
    // Show high score if available
    if (highScore > 0) {
      ctx.font = '16px monospace';
      ctx.fillText(`High Score: ${highScore}`, width / 2, height / 2 + 25);
    }
  } else if (state.gameOver) {
    // Game over screen
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    // Draw card
    const cardWidth = 280;
    const cardHeight = 200;
    drawCard(ctx, width / 2, height / 2, cardWidth, cardHeight, cardBackground, cardBorder);

    ctx.fillStyle = text;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText('GAME OVER', width / 2, height / 2 - 50);
    ctx.font = '20px monospace';
    ctx.fillText(`Score: ${state.score}`, width / 2, height / 2);
    ctx.fillText(`High Score: ${highScore}`, width / 2, height / 2 + 30);
    ctx.font = '16px monospace';
    ctx.fillText('Press SPACE to Restart', width / 2, height / 2 + 70);
  } else if (state.paused) {
    // Pause screen
    ctx.fillStyle = overlay;
    ctx.fillRect(0, 0, width, height);

    // Draw card
    const cardWidth = 260;
    const cardHeight = 120;
    drawCard(ctx, width / 2, height / 2, cardWidth, cardHeight, cardBackground, cardBorder);

    ctx.fillStyle = text;
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillText('PAUSED', width / 2, height / 2 - 20);
    ctx.font = '18px monospace';
    ctx.fillText('Press SPACE to Resume', width / 2, height / 2 + 20);
  } else {
    // In-game score display
    ctx.fillStyle = text;
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillText(`Score: ${state.score}`, 10, 10);
    ctx.fillText(`High: ${highScore}`, 10, 35);
  }
}

/**
 * Main draw function
 */
export function draw(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: GameState,
  isDarkTheme: boolean,
  highScore: number
) {
  // Get theme colors from CSS variables
  const themeColors = getThemeColors(isDarkTheme);
  const gameColors = isDarkTheme ? COLORS.dark : COLORS.light;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw grid using theme colors
  drawGrid(ctx, width, height, themeColors.background, themeColors.grid);

  // Draw snake (only if game has started)
  // Show snake and food even when paused so player can see game state
  if (state.started && !state.gameOver) {
    drawSnake(ctx, state.snake, width, height, themeColors);
    drawFood(ctx, state.food, width, height, themeColors);
  }

  // Draw overlay using theme colors
  drawOverlay(
    ctx,
    state,
    width,
    height,
    themeColors.text,
    themeColors.cardBackground,
    themeColors.cardBorder,
    gameColors.overlay,
    highScore
  );
}
