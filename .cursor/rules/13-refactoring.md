# Refactoring Guidelines

## When to Refactor

**Refactor when:**
1. **Code duplication**: Same logic appears in multiple places (DRY principle)
2. **Complex functions**: Functions doing too much (extract into smaller functions)
3. **Poor naming**: Names don't clearly express intent
4. **Technical debt**: Code that works but is hard to understand or maintain
5. **Before adding features**: Clean up related code before extending it
6. **After understanding**: Once you understand what code does, improve it

**Don't refactor when:**
- Code works and is rarely touched
- Refactoring would introduce risk without clear benefit
- You don't fully understand the code yet

## Refactoring Principles

1. **Small, incremental changes**: Refactor in small steps, test after each
2. **Preserve behavior**: Refactoring should not change functionality
3. **Run tests**: Ensure tests pass before and after refactoring
4. **Update documentation**: Update docs if architecture changes
5. **One thing at a time**: Don't mix refactoring with new features

## Common Refactoring Patterns

### Extract Function
- When: Function is too long or does multiple things
- How: Extract logical sections into separate functions
- Benefit: Better readability, reusability, testability

### Extract Hook
- When: Component has complex logic that could be reused
- How: Move logic to custom hook
- Benefit: Reusability, separation of concerns

### Extract Component
- When: Component is too large or has multiple responsibilities
- How: Split into smaller, focused components
- Benefit: Better maintainability, reusability

### Consolidate Duplicate Code
- When: Same logic appears in multiple places
- How: Extract to shared utility or hook
- Benefit: Single source of truth, easier maintenance

## Refactoring Checklist

Before refactoring:
- [ ] Understand what the code does
- [ ] Identify what needs to be improved
- [ ] Ensure tests exist (or write them)
- [ ] Plan the refactoring approach

During refactoring:
- [ ] Make small, incremental changes
- [ ] Run tests after each change
- [ ] Keep code working at all times
- [ ] Update related documentation

After refactoring:
- [ ] All tests pass
- [ ] Code is cleaner and more maintainable
- [ ] Documentation is updated
- [ ] No new bugs introduced

