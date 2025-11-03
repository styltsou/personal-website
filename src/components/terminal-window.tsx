/**
 * Terminal Window Component
 * Visual terminal window component (no actual functionality)
 */

export default function TerminalWindow() {
  return (
    <div className="terminal-window h-full w-full bg-[#1a1a1a] p-4 font-mono text-sm">
      {/* Terminal header */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-full bg-[#ff5f57]"></div>
          <div className="h-3 w-3 rounded-full bg-[#ffbd2e]"></div>
          <div className="h-3 w-3 rounded-full bg-[#28c940]"></div>
        </div>
        <span className="text-xs text-gray-400">Terminal</span>
      </div>

      {/* Terminal content */}
      <div className="space-y-1 text-[#d0d0d0]">
        {/* Prompt line */}
        <div className="flex items-center gap-2">
          <span className="text-[#00ff00]">$</span>
          <span className="text-[#7da3d1]">~</span>
        </div>

        {/* Output lines */}
        <div className="text-[#7da3d1]">
          Welcome to Terminal v1.0
        </div>
        <div className="text-[#d0d0d0]">
          Type commands here (not functional yet)
        </div>
        <div className="mt-2 text-[#888]">
          {'> '}
          <span className="inline-block h-4 w-2 animate-pulse bg-[#00ff00]"></span>
        </div>
      </div>
    </div>
  );
}

