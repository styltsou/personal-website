import { defineCollection, z } from 'astro:content';

const tracks = defineCollection({
  type: 'data',
  schema: z.object({
    tracks: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        artist: z.string(),
        album: z.string(),
        albumArt: z.string(),
        previewUrl: z.string(),
        spotifyUrl: z.string(), // Link to track on Spotify
        duration: z.number(), // Duration in milliseconds
      })
    ),
    error: z.string().nullable(),
  }),
});

export const collections = {
  tracks,
};
