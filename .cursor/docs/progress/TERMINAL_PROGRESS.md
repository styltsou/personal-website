# Terminal Implementation Progress

> **Terminal Component**: `src/components/terminal-window/index.tsx`  
> **Status**: In Development  
> **Last Updated**: 2025-01-XX

---

## ✅ Completed Features

### Core Functionality

- ✅ Basic terminal interface with command input/output
- ✅ Command history with arrow key navigation (↑/↓)
- ✅ Command validation with color highlighting (blue for valid, red for invalid)
- ✅ Multiple commands implemented:
  - `help` - Show available commands
  - `clear` - Clear the terminal
  - `echo <text>` - Echo text back
  - `exit` - Close the terminal window
  - `pwd` - Print working directory
  - `ls` - List directory contents (context-aware)
  - `cd <directory>` - Change directory

### Directory Navigation

- ✅ Directory navigation system with `cd` command
- ✅ Context-aware `ls` command:
  - In `~`: Shows `about  contact  desktop  projects`
  - In `~/desktop`: Lists actual desktop icons from config (`cv.pdf`, `Trash`, `Terminal`, `Wikipedia`)
- ✅ Current directory tracking and display in prompt
- ✅ `pwd` command shows current directory

### Autocomplete

- ✅ Tab key autocomplete for `cd` command
- ✅ Case-insensitive directory matching
- ✅ Common prefix completion for multiple matches
- ✅ Shows all matches when no common prefix exists

### UI/UX

- ✅ Ubuntu-style prompt: `username@hostname:directory$`
- ✅ Dynamic browser detection (Chrome, Firefox, Safari, Edge, Opera, Brave)
- ✅ Theme-aware colors (white/black for prompt, blue for commands/directories)
- ✅ Vibrant violet accent color for prompt symbol (`$`)
- ✅ Larger font size (1.25rem)
- ✅ Command color highlighting while typing

### Configuration

- ✅ Environment variables for colors:
  - `PUBLIC_TERMINAL_VALID_COLOR` (default: `#7da3d1`)
  - `PUBLIC_TERMINAL_INVALID_COLOR` (default: `#ff4444`)
- ✅ Hardcoded username: `styltsou`
- ✅ Dynamic hostname from browser user agent

---

## 🐛 Known Bugs

### Critical Bugs

#### 1. **Terminal Focus Loss**

- **Issue**: When the terminal loses focus, clicking back into it doesn't restore cursor focus properly
- **Symptoms**:
  - Cursor doesn't appear in input field
  - Cannot type commands
  - Need to manually click the input field multiple times
- **Location**: `src/components/terminal-window/index.tsx`
- **Priority**: High
- **Status**: Open

#### 2. **History Prompt Updates After `cd`**

- **Issue**: When executing `cd` command, all previous prompts in command history update to show the new current directory
- **Expected**: History should preserve the directory path that was active when each command was executed
- **Symptoms**:
  - Old commands show `~/desktop$` even though they were executed in `~`
  - Historical context is lost
- **Location**: `src/components/terminal-window/index.tsx` - Prompt rendering in history
- **Priority**: Medium
- **Status**: Open
- **Solution**: Store directory state with each command in history

#### 3. **Autocomplete Doesn't Rotate on Empty `cd`**

- **Issue**: When typing `cd ` (with space) and pressing Tab, it should cycle through available directories
- **Current Behavior**: Prints `cd ..` and moves on instead of rotating
- **Expected Behavior**:
  - First Tab: Show all available directories
  - Subsequent Tabs: Cycle through directories one by one
- **Location**: `src/components/terminal-window/index.tsx` - `handleAutocomplete` function
- **Priority**: Medium
- **Status**: Open

---

## 🚀 Planned Features

### High Priority

#### 1. **Open Windows from Terminal**

- **Description**: Add a command to open windows from the terminal (e.g., `open about`, `open terminal`)
- **Commands to add**:
  - `open <window-id>` - Open a window by ID
  - `open about` - Opens About window
  - `open projects` - Opens Projects window
  - `open contact` - Opens Contact window
  - `open terminal` - Opens Terminal window
  - `open wikipedia` - Opens Wikipedia window
- **Implementation Notes**:
  - Use `useWindowStore` to access `openWindow` function
  - Add window IDs to valid commands list
  - Update help text
- **Location**: `src/components/terminal-window/index.tsx`
- **Status**: Planned

#### 2. **Hidden Files Support (`ls -a`)**

- **Description**: Support `-a` flag for `ls` command to show hidden files (starting with `.`)
- **Commands to add**:
  - `ls -a` - Show all files including hidden ones
  - `ls` - Show only visible files (current behavior)
- **Implementation Notes**:
  - Parse flags from `ls` command
  - Filter desktop icons based on `.` prefix when `-a` flag is not present
  - Add hidden files/directories to directory listings
  - Example hidden items: `.config`, `.desktop`, etc.
- **Location**: `src/components/terminal-window/index.tsx` - `ls` command handler
- **Status**: Planned

### Medium Priority

#### 3. **Command Aliases**

- **Description**: Support command aliases (e.g., `ll` for `ls -l`, `..` for `cd ..`)
- **Status**: Planned

#### 4. **Better Error Messages**

- **Description**: More descriptive error messages for invalid commands and paths
- **Status**: Planned

#### 5. **Command History Persistence**

- **Description**: Persist command history across terminal sessions
- **Status**: Planned

#### 6. **Multi-line Command Support**

- **Description**: Support commands that span multiple lines (with `\` continuation)
- **Status**: Planned

### Low Priority

#### 7. **Command Suggestions**

- **Description**: Show "Did you mean?" suggestions for typos
- **Status**: Planned

#### 8. **Directory Permissions**

- **Description**: Show directory/file permissions (read, write, execute)
- **Status**: Planned

#### 9. **File Operations**

- **Description**: Add commands like `cat`, `touch`, `mkdir`, `rm`
- **Status**: Planned

---

## 📝 Implementation Notes

### Directory Structure

- Root directory (`~`): Contains `about`, `contact`, `desktop`, `projects`
- Desktop directory (`~/desktop`): Contains actual desktop icons from config
- Future: Support nested directories

### Available Directories

- **In `~`**: `desktop`, `~`, `..`
- **In `~/desktop`**: `..`, `~`

### Color Scheme

- **Prompt elements**: Inherit theme color (white/black)
- **Valid commands**: Blue (`#7da3d1`)
- **Invalid commands**: Red (`#ff4444`)
- **Output/Directories**: Blue (`#7da3d1`)
- **Prompt symbol**: Violet (`#a855f7`)
- **Error messages**: Red (`#ff4444` / `#ff6666` in dark theme)

### Browser Detection

- Detects: Chrome, Firefox, Safari, Edge, Opera, Brave
- Falls back to `website` if detection fails
- Uses `navigator.brave` for Brave detection (more reliable than user agent)

---

## 🔧 Technical Details

### Dependencies

- React hooks: `useState`, `useRef`, `useEffect`, `useCallback`
- Zustand store: `useWindowStore` for window management
- Icon config: `apps` from `src/app-config.ts`

### Key Functions

- `executeCommand()` - Main command execution handler
- `handleAutocomplete()` - Tab key autocomplete logic
- `getAvailableDirectories()` - Get directories for current location
- `detectBrowser()` - Browser detection from user agent
- `getInputColor()` - Dynamic color for command validation

### State Management

- `currentDirectory` - Current working directory
- `input` - Current input text
- `history` - Command history array
- `historyIndex` - Current position in history
- `lines` - Terminal output lines
- `hostname` - Detected browser name

---

## 📚 References

- Terminal component: `src/components/terminal-window/index.tsx`
- Styles: `src/components/terminal-window/styles.module.scss`
- Icon config: `src/app-config.ts`
- Window store: `src/store/window/slice.ts`

---

## 🎯 Future Enhancements

- Terminal tabs/multiple sessions
- Command output pagination
- Terminal themes/customization
- Shell scripting support
- Background process execution
- Terminal output streaming
- Copy/paste support improvements
- Terminal resizing
- Font customization
- Terminal bell sound effects
