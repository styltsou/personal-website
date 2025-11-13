/**
 * Game constants and configuration
 */

// Physics constants
export const GRAVITY = 0.5;
export const JUMP_STRENGTH = -8;
export const PIPE_SPEED = 2;

// Base game resolution (virtual resolution the game is designed for)
export const BASE_WIDTH = 600;
export const BASE_HEIGHT = 400;

// Game dimensions (in base resolution)
export const PIPE_SPACING = 300;
export const PIPE_WIDTH = 70;
export const BIRD_SIZE = 36; // Increased from 30
export const GAP_SIZE = 150;

// Color schemes for light and dark themes
export const COLORS = {
  light: {
    sky: '#87ceeb',
    ground: '#e6d5c3',
    groundBorder: '#000000',
    groundGreen: '#7cb342',
    groundAmber: '#ffa500',
    bird: '#ffd700', // Gold (legacy, kept for compatibility)
    birdBorder: '#000000', // Black outline
    birdHead: '#ffd700', // Yellow head
    birdBody: '#ff8c00', // Orange body
    birdBeak: '#ff0000', // Red beak
    birdEye: '#ffffff', // White eye
    birdEyePupil: '#000000', // Black pupil
    birdWing: '#ffffff', // White wing
    pipe: '#4caf50',
    pipeCap: '#66bb6a',
    pipeBorder: '#000000',
    text: '#ffffff',
    textShadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  dark: {
    sky: '#1a1a2e',
    ground: '#9d8a7a', // Darker version of light mode sand (#e6d5c3)
    groundBorder: '#000000',
    groundGreen: '#2d5a26', // Darker green for dark mode
    groundAmber: '#ffa500',
    bird: '#ffd700', // Gold (legacy, kept for compatibility)
    birdBorder: '#000000', // Black outline
    birdHead: '#ffd700', // Yellow head
    birdBody: '#ff8c00', // Orange body
    birdBeak: '#ff0000', // Red beak
    birdEye: '#ffffff', // White eye
    birdEyePupil: '#000000', // Black pupil
    birdWing: '#ffffff', // White wing
    pipe: '#2e7d32', // Darker green for dark mode
    pipeCap: '#388e3c', // Darker cap for dark mode
    pipeBorder: '#000000',
    text: '#ffffff',
    textShadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
};

