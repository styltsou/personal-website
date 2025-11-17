# Photos App - Image Sizing Issue

## Problem
The image in the photos app appears too small and doesn't fill the available window space as expected.

## Current Implementation
- Image uses `width: 100%` and `height: 100%` with `object-fit: contain`
- Rotation is handled via a wrapper div with transform
- For 90/270 degree rotations, JavaScript calculates scale to prevent overflow
- Scale calculation: `Math.min(containerWidth / img.naturalHeight, containerHeight / img.naturalWidth, 1)`

## Issues
1. Image doesn't fill the available space - appears smaller than expected
2. The sizing calculation may not be accounting for all layout constraints properly
3. CSS-only approach was attempted but transforms don't affect the box model, so JavaScript calculation is needed

## Potential Solutions to Explore
1. Check if padding calculations are correct (currently subtracting 32px for 1.6rem padding)
2. Verify container dimensions are being measured correctly
3. Consider using `object-fit: scale-down` or different sizing approach
4. May need to calculate based on the wrapper's actual rendered size rather than container
5. Could try using CSS container queries if browser support allows
6. Consider if the issue is with the initial image load vs after rotation

## Related Files
- `src/components/apps/photos/index.tsx` - Rotation and scaling logic
- `src/components/apps/photos/styles.module.scss` - Image and wrapper styles

