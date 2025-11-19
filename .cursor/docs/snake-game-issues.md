# Snake Game - Known Issues & Future Improvements

## Responsiveness & Window Resizing Issues

### Grid Stretching
- When the window is resized, the grid can stretch and become distorted
- The grid should maintain its aspect ratio or recalculate cell sizes properly on resize

### Score Display Overlap
- Score text can end up sitting on top of the grid when window is resized
- Score positioning should be adjusted or the grid area should account for score display

### Canvas Resizing
- Canvas may not properly handle window resize events
- Need to ensure canvas redraws correctly when window dimensions change

## Future Fixes Needed
- [ ] Fix grid aspect ratio maintenance on resize
- [ ] Reposition score display to avoid grid overlap
- [ ] Improve canvas resize handling
- [ ] Test responsiveness on various window sizes
- [ ] Consider adding minimum window size constraints for the game


