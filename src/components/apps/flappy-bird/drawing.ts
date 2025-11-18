/**
 * Canvas drawing functions for Flappy Bird game
 */

import type { GameState } from './types';
import { COLORS } from './constants';
import { PIPE_WIDTH, BIRD_SIZE } from './constants';

// Bird SVG - loaded as image
let birdImage: HTMLImageElement | null = null;
let birdImageLoaded = false;

// Load bird SVG image
function loadBirdImage() {
  if (birdImageLoaded || birdImage) return;

  birdImage = new Image();
  birdImage.onload = () => {
    birdImageLoaded = true;
  };
  birdImage.onerror = () => {
    console.error('Failed to load bird SVG');
  };

  // Load from public folder
  birdImage.src = '/bird.svg';
}

// Initialize image loading
if (typeof window !== 'undefined') {
  loadBirdImage();
}

/**
 * Draw background (sky and ground)
 */
function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: typeof COLORS.light
) {
  const groundHeight = height * 0.1;
  const groundTop = height - groundHeight;

  // Draw sky
  ctx.fillStyle = colors.sky;
  ctx.fillRect(0, 0, width, groundTop);

  // Draw ground
  ctx.fillStyle = colors.ground;
  ctx.fillRect(0, groundTop, width, groundHeight);

  // Draw ground border (2px black line to match pipe borders)
  ctx.fillStyle = colors.groundBorder;
  ctx.fillRect(0, groundTop, width, 2);

  // Draw green bar (12px)
  ctx.fillStyle = colors.groundGreen;
  ctx.fillRect(0, groundTop + 2, width, 12);

  // Draw amber stripe (3px)
  ctx.fillStyle = colors.groundAmber;
  ctx.fillRect(0, groundTop + 14, width, 3);
}

/**
 * Draw a single pipe
 */
function drawPipe(
  ctx: CanvasRenderingContext2D,
  pipe: { x: number; topHeight: number; gap: number },
  height: number,
  colors: typeof COLORS.light
) {
  const capWidth = PIPE_WIDTH + 8;
  const capHeight = 20;

  // Draw pipe bodies first (so caps appear on top)

  // Top pipe
  ctx.fillStyle = colors.pipe;
  ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
  ctx.strokeStyle = colors.pipeBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

  // Bottom pipe
  ctx.fillStyle = colors.pipe;
  ctx.fillRect(
    pipe.x,
    pipe.topHeight + pipe.gap,
    PIPE_WIDTH,
    height - (pipe.topHeight + pipe.gap)
  );
  ctx.strokeRect(
    pipe.x,
    pipe.topHeight + pipe.gap,
    PIPE_WIDTH,
    height - (pipe.topHeight + pipe.gap)
  );

  // Draw caps on top of pipes

  // Top pipe cap (drawn after pipe body so it appears on top)
  ctx.fillStyle = colors.pipeCap;
  ctx.fillRect(pipe.x - 4, pipe.topHeight - capHeight, capWidth, capHeight);
  ctx.strokeStyle = colors.pipeBorder;
  ctx.lineWidth = 2;
  ctx.strokeRect(pipe.x - 4, pipe.topHeight - capHeight, capWidth, capHeight);

  // Bottom pipe cap
  ctx.fillStyle = colors.pipeCap;
  ctx.fillRect(pipe.x - 4, pipe.topHeight + pipe.gap, capWidth, capHeight);
  ctx.strokeRect(pipe.x - 4, pipe.topHeight + pipe.gap, capWidth, capHeight);
}

/**
 * Draw the bird using the SVG image
 */
function drawBird(
  ctx: CanvasRenderingContext2D,
  birdY: number,
  birdVelocity: number,
  width: number,
  colors: typeof COLORS.light
) {
  const birdX = Math.max(100, width * 0.15);
  const birdRotation =
    Math.min(Math.max(birdVelocity * 3, -30), 30) * (Math.PI / 180);

  ctx.save();
  ctx.translate(birdX + BIRD_SIZE / 2, birdY + BIRD_SIZE / 2);
  ctx.rotate(birdRotation);

  // If SVG image is loaded, draw it (background should be transparent)
  if (birdImage && birdImageLoaded) {
    // SVG is 840x859, scale to BIRD_SIZE while maintaining aspect ratio
    const svgAspectRatio = 840 / 859;
    const drawWidth = BIRD_SIZE;
    const drawHeight = BIRD_SIZE / svgAspectRatio;

    ctx.drawImage(
      birdImage,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    );
  } else {
    // Fallback: simple bird shape if image not loaded yet
    ctx.fillStyle = colors.birdHead;
    ctx.beginPath();
    ctx.ellipse(0, 0, BIRD_SIZE / 2, (BIRD_SIZE / 2) * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.birdBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Try to load the image
    if (typeof window !== 'undefined' && !birdImage) {
      loadBirdImage();
    }
  }

  ctx.restore();
}

/**
 * Draw the score
 */
function drawScore(
  ctx: CanvasRenderingContext2D,
  score: number,
  width: number,
  colors: typeof COLORS.light
) {
  // Scale font size based on canvas width to prevent skewing
  const fontSize = Math.max(28, width * 0.05); // Minimum 28px, scales with width
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const scoreText = score.toString();
  const shadowOffset = 2;

  // Draw text shadow for outline effect
  ctx.fillStyle = colors.textShadow;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i !== 0 || j !== 0) {
        ctx.fillText(
          scoreText,
          width / 2 + i * shadowOffset,
          20 + j * shadowOffset
        );
      }
    }
  }

  // Draw main text
  ctx.fillStyle = colors.text;
  ctx.fillText(scoreText, width / 2, 20);
}

/**
 * Draw overlay screens (start screen or game over)
 */
function drawOverlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  width: number,
  height: number,
  colors: typeof COLORS.light,
  highScore: number
) {
  ctx.fillStyle = colors.overlay;
  ctx.fillRect(0, 0, width, height);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Scale font sizes based on canvas dimensions to prevent skewing
  // Smaller sizes with better spacing
  const titleSize = Math.max(24, Math.min(width, height) * 0.06);
  const scoreSize = Math.max(18, Math.min(width, height) * 0.04);
  const instructionSize = Math.max(14, Math.min(width, height) * 0.025);

  // Use orange color for titles (Flappy Bird style) - using the orange from the SVGs
  const titleColor = '#FF8C00'; // Dark orange (matches bird body color)

  if (state.gameOver) {
    // Game Over text
    ctx.fillStyle = titleColor;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.fillText('Game Over!', width / 2, height / 2 - 70);
    ctx.fillStyle = colors.text;
    ctx.font = `bold ${scoreSize}px monospace`;
    ctx.fillText(`Score: ${state.score}`, width / 2, height / 2 - 20);
    ctx.fillText(`High Score: ${highScore}`, width / 2, height / 2 + 15);
    ctx.font = `${instructionSize}px monospace`;
    ctx.fillText('Press SPACE to restart', width / 2, height / 2 + 55);
  } else {
    // Start screen - increased spacing between title and instruction
    ctx.fillStyle = titleColor;
    ctx.font = `bold ${titleSize}px monospace`;
    ctx.fillText('Flappy Bird', width / 2, height / 2 - 30);
    ctx.fillStyle = colors.text;
    ctx.font = `${instructionSize}px monospace`;
    ctx.fillText('Press SPACE to start', width / 2, height / 2 + 25);
  }
}

/**
 * Main drawing function - draws the entire game state
 */
export function draw(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  state: GameState,
  isDarkTheme: boolean,
  highScore: number = 0
) {
  const colors = isDarkTheme ? COLORS.dark : COLORS.light;

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Draw background
  drawBackground(ctx, width, height, colors);

  // Draw pipes
  state.pipes.forEach(pipe => {
    drawPipe(ctx, pipe, height, colors);
  });

  // Draw bird
  drawBird(ctx, state.birdY, state.birdVelocity, width, colors);

  // Draw score
  drawScore(ctx, state.score, width, colors);

  // Draw overlay screens if needed
  if (state.gameOver || (!state.started && !state.gameOver)) {
    drawOverlay(ctx, state, width, height, colors, highScore);
  }
}
