/**
 * Menu Bar Component
 * Top system menu bar with window buttons, clock, date, and theme toggle
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import ThemeToggle from './theme-toggle';

import { windows } from '../../data/windows';
import { useWindowStore } from '../../stores/window-store';
import { formatDate, formatTime } from '../../utils/date-time';
import { cn } from '../../utils/cn';
import styles from './styles.module.scss';

// Animation variants
const buttonVariants = {
  active: {
    backgroundColor: 'var(--retro-focus-blue)',
    boxShadow: 'none',
    transition: {
      duration: 0.03,
      ease: 'easeOut' as const,
    },
  },
  hasState: {
    backgroundColor: 'var(--retro-button-active-bg)',
    boxShadow: 'inset 1px 1px 1px var(--retro-shadow-soft)',
    transition: {
      duration: 0.03,
      ease: 'easeOut' as const,
    },
  },
  default: {
    backgroundColor: 'var(--retro-button-bg)',
    boxShadow: 'none',
    transition: {
      duration: 0.03,
      ease: 'easeOut' as const,
    },
  },
};

const closeIconVariants = {
  initial: {
    width: 0,
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.03,
      ease: 'easeOut' as const,
    },
  },
  animate: {
    width: 12,
    opacity: 0.7,
    x: 0,
    transition: {
      duration: 0.03,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    width: 0,
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.03,
      ease: 'easeOut' as const,
    },
  },
};

// Subtle animation variants for window buttons appearing/disappearing
const windowButtonVariants = {
  initial: {
    opacity: 0,
    x: -8,
    transition: {
      duration: 0.05,
      ease: 'easeOut' as const,
    },
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.05,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    x: -8,
    transition: {
      duration: 0.05,
      ease: 'easeIn' as const,
    },
  },
};

export default function MenuBar() {
  const windowStates = useWindowStore((state) => state.windowStates);
  const activeWindowId = useWindowStore((state) => state.activeWindowId);
  const openWindow = useWindowStore((state) => state.openWindow);
  const closeWindow = useWindowStore((state) => state.closeWindow);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const getWindowButtonState = (windowId: string) => {
    const windowState = windowStates.find((ws) => ws.id === windowId);
    const exists = !!windowState;
    const isMinimized = windowState?.isMinimized ?? false;
    const isOpen = exists && !isMinimized;
    const isActive = activeWindowId === windowId;
    const hasState = exists && (isOpen || isMinimized);

    return { exists, isMinimized, isOpen, isActive, hasState };
  };

  const getButtonClasses = (state: ReturnType<typeof getWindowButtonState>) => {
    return cn(
      'retro-menu-bar-button',
      'retro-focus-ring',
      state.isOpen && 'retro-menu-bar-button-open',
      state.exists && state.isMinimized && 'retro-menu-bar-button-minimized',
      state.isActive && 'retro-menu-bar-button-focused'
    );
  };

  const getButtonVariant = (state: ReturnType<typeof getWindowButtonState>) => {
    if (state.isActive) return 'active';
    if (state.hasState) return 'hasState';
    return 'default';
  };

  const getAriaLabel = (
    windowTitle: string,
    state: ReturnType<typeof getWindowButtonState>
  ) => {
    const status = state.exists
      ? state.isMinimized
        ? 'Minimized'
        : 'Open'
      : 'Open';
    return `${status} ${windowTitle} window${state.isActive ? ' (active)' : ''}`;
  };

  const handleCloseClick = (windowId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    closeWindow(windowId);
  };

  const handleCloseKeyDown = (windowId: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      closeWindow(windowId);
    }
  };

  return (
    <div className="retro-menu-bar">
      <div className="retro-menu-bar-left">
        <span className="retro-menu-bar-logo">styltsou</span>
        <AnimatePresence mode="popLayout">
          {windows
            .filter((window) => {
              // Show pinned windows always, or unpinned windows only if they exist (are open)
              return (
                window.pinned === true ||
                windowStates.some((ws) => ws.id === window.id)
              );
            })
            .map((window) => {
              const state = getWindowButtonState(window.id);

              // TODO: Variants stuff looks weird, I need to understand them

              return (
                <motion.button
                  key={window.id}
                  type="button"
                  className={cn(getButtonClasses(state), styles.button)}
                  onClick={() => openWindow(window.id)}
                  aria-label={getAriaLabel(window.title, state)}
                  initial="initial"
                  animate={['animate', getButtonVariant(state)]}
                  exit="exit"
                  variants={{
                    // Enter/exit animations
                    initial: windowButtonVariants.initial,
                    animate: {
                      ...windowButtonVariants.animate,
                    },
                    exit: windowButtonVariants.exit,
                    // State-based background colors
                    active: buttonVariants.active,
                    hasState: buttonVariants.hasState,
                    default: buttonVariants.default,
                  }}
                  layout="position"
                  transition={{
                    layout: {
                      duration: 0.05,
                      ease: 'easeOut',
                    },
                  }}
                >
                  <AnimatePresence mode="wait">
                    {state.exists && (
                      <motion.span
                        key="close-icon"
                        className="retro-menu-bar-button-close-icon"
                        variants={closeIconVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        onClick={(e) => handleCloseClick(window.id, e)}
                        onKeyDown={(e) => handleCloseKeyDown(window.id, e)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Close ${window.title} window`}
                      >
                        ×
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span>{window.title}</span>
                </motion.button>
              );
            })}
        </AnimatePresence>
      </div>
      <div className="retro-menu-bar-right">
        <div className="retro-menu-bar-time">
          <span className="retro-menu-bar-date">{formatDate(currentTime)}</span>
          <span className="retro-menu-bar-clock">
            {formatTime(currentTime)}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}
