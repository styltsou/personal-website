# PDF Viewer Persistence Issue

## Problem
When refreshing the page with a PDF viewer window open, the PDF file path is not restored correctly from sessionStorage, resulting in "No content available" or "No PDF file to display" error.

## Root Cause
The `filePath` prop is not being properly restored from persisted window state. When window state is saved to sessionStorage and then restored, the props may not include the `filePath` that was originally passed when opening the file.

## Related Files
- `src/store/window/slice.ts` - Window state persistence and restoration
- `src/components/apps/pdf-viewer/index.tsx` - PDF viewer component
- `src/components/window/index.tsx` - Window component that passes props

## Notes
- Similar issue was resolved for the Photos app, but the solution approach is unclear
- Window ID format: `${appId}-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`
- The filePath could potentially be reconstructed from the window ID, but this approach was attempted and didn't work

## Future Fix
Need to investigate how the Photos app handles this and apply a similar solution, or find a way to ensure `filePath` prop is always included in persisted window state.


