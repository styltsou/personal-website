# Error Handling

## Error Handling Principles

1. **Fail gracefully**: Never crash the entire app due to a single error
2. **User-friendly messages**: Show meaningful errors to users
3. **Log errors**: Log errors for debugging (console.error)
4. **Handle edge cases**: Consider what can go wrong
5. **Validate inputs**: Check inputs before processing

## Error Handling Patterns

### Try-Catch for Async Operations

**ALWAYS use try-catch for:**
- API calls (`fetch`, async functions)
- File operations
- JSON parsing
- localStorage/sessionStorage operations
- Any operation that can throw

```typescript
// Good
try {
  const response = await fetch(url);
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Failed to fetch data:', error);
  return null; // Or show user-friendly error
}

// Bad: No error handling
const response = await fetch(url);
const data = await response.json();
```

### Validation Before Operations

```typescript
// Good: Validate first
if (!config || !config.path) {
  return null; // Early return
}

// Bad: Assume it exists
const content = await fetch(config.path);
```

### Error Boundaries (React)

For React components, consider error boundaries for:
- Component tree errors
- Rendering errors
- Lifecycle errors

### User Feedback

**Show errors to users when:**
- Action fails and user needs to know
- User can retry the action
- Error affects user experience

**Don't show errors for:**
- Expected failures (e.g., optional features)
- Background operations that can fail silently
- Development-only errors

## Error Handling in Key Areas

### Window Management
- Handle invalid window IDs gracefully
- Validate window positions/sizes
- Handle persistence errors (fallback to defaults)

### Content Loading
- Handle network errors (show retry option)
- Handle parsing errors (show fallback message)
- Cache errors to prevent repeated failures

### State Management
- Validate state updates
- Handle corrupted persisted state
- Provide fallback values

### Icon Management
- Handle invalid grid positions
- Handle collision detection edge cases
- Validate icon configurations

## Error Logging

```typescript
// Good: Log with context
console.error('Failed to load window content:', {
  windowId,
  path: config.path,
  error
});

// Bad: Silent failure or generic error
console.error('Error');
```

## Error Recovery

When possible, provide recovery options:
- Retry failed operations
- Fallback to default values
- Clear corrupted state
- Reset to known good state

## Example Patterns

### Async Operation with Error Handling
```typescript
async function loadContent(windowId: string): Promise<string | null> {
  try {
    const config = apps.find(w => w.id === windowId);
    if (!config?.path) return null;
    
    const response = await fetch(config.path);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    return parseContent(html);
  } catch (error) {
    console.error(`Failed to load content for ${windowId}:`, error);
    return null; // Graceful failure
  }
}
```

### State Validation
```typescript
function updateWindowPosition(id: string, position: WindowPosition) {
  // Validate inputs
  if (!id || !position || typeof position.x !== 'number') {
    console.warn('Invalid position update:', { id, position });
    return;
  }
  
  // Validate bounds
  const constrained = constrainPosition(position);
  
  // Update state
  set((state) => ({
    windowStates: state.windowStates.map(ws =>
      ws.id === id ? { ...ws, position: constrained } : ws
    )
  }));
}
```

