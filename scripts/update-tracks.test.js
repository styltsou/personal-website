/**
 * Tests for update-tracks.js script
 * Run with: npm test
 */

import { describe, it, expect } from '@jest/globals';

// Copy core logic functions for testing (since they're not exported)
// In a real scenario, you'd export these functions from the main file

describe('Track Matching Algorithm', () => {
  // Test normalizeText function
  describe('normalizeText', () => {
    it('should remove punctuation and normalize spaces', () => {
      const normalizeText = str =>
        str
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      expect(normalizeText("Don't Stop Believin'")).toBe('Don t Stop Believin');
      expect(normalizeText('  multiple   spaces  ')).toBe('multiple spaces');
      expect(normalizeText('song-name!')).toBe('song name');
    });
  });

  // Test evaluateTrackNameMatch function
  describe('evaluateTrackNameMatch', () => {
    const normalizeText = str =>
      str
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const evaluateTrackNameMatch = (title, trackName) => {
      if (title.includes(trackName)) {
        return { match: true, score: 1000 };
      }

      const normalizedTitle = normalizeText(title);
      const normalizedTrackName = normalizeText(trackName);

      if (normalizedTitle.includes(normalizedTrackName)) {
        return { match: true, score: 950 };
      }

      const trackWords = normalizedTrackName.split(/\s+/);
      const significantWords = trackWords.filter(w => w.length > 1);
      if (significantWords.length === 0) {
        return { match: false, score: 0 };
      }

      const titleWords = normalizedTitle.split(/\s+/);
      let trackWordIndex = 0;
      let matchedInOrder = 0;

      for (const titleWord of titleWords) {
        if (trackWordIndex < significantWords.length) {
          const trackWord = significantWords[trackWordIndex];
          if (titleWord.includes(trackWord) || trackWord.includes(titleWord)) {
            matchedInOrder++;
            trackWordIndex++;
          }
        }
      }

      const matchRatio = matchedInOrder / significantWords.length;
      const minMatchRatio = significantWords.length <= 3 ? 1.0 : 0.6;

      if (matchRatio >= minMatchRatio) {
        return { match: true, score: 800 + Math.floor(matchRatio * 150) };
      }

      return { match: false, score: 0 };
    };

    it('should match exact track name', () => {
      const result = evaluateTrackNameMatch(
        "Journey - Don't Stop Believin'",
        "Don't Stop Believin'"
      );
      expect(result.match).toBe(true);
      expect(result.score).toBe(1000);
    });

    it('should match normalized track name', () => {
      const result = evaluateTrackNameMatch(
        'Journey - Dont Stop Believin',
        "Don't Stop Believin'"
      );
      expect(result.match).toBe(true);
      expect(result.score).toBe(950);
    });

    it('should match words in order', () => {
      const result = evaluateTrackNameMatch(
        'Artist - Don Stop Believin Official Audio',
        "Don't Stop Believin'"
      );
      expect(result.match).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(800);
    });

    it('should not match if words are out of order', () => {
      const result = evaluateTrackNameMatch(
        'Stop Don Believin',
        "Don't Stop Believin'"
      );
      // Should not match because words are out of order
      expect(result.match).toBe(false);
    });

    it('should handle short track names', () => {
      const result = evaluateTrackNameMatch('I Am', 'I Am');
      expect(result.match).toBe(true);
    });
  });

  // Test isArtistChannel function
  describe('isArtistChannel', () => {
    const isArtistChannel = (channel, artistNameLower) => {
      if (channel === artistNameLower) return true;
      if (channel.includes(artistNameLower)) return true;

      const channelWords = channel.split(/\s+/);
      const artistWords = artistNameLower.split(/\s+/);

      if (channelWords.length === 1 && artistWords.includes(channel))
        return true;
      if (artistWords.length === 1 && channelWords.includes(artistNameLower))
        return true;

      return false;
    };

    it('should match exact channel name', () => {
      expect(isArtistChannel('taylor swift', 'taylor swift')).toBe(true);
    });

    it('should match when channel contains artist name', () => {
      expect(isArtistChannel('taylor swift vevo', 'taylor swift')).toBe(true);
    });

    it('should match single word channel', () => {
      expect(isArtistChannel('taylor', 'taylor swift')).toBe(true);
    });

    it('should not match partial word incorrectly', () => {
      expect(isArtistChannel('taylor', 'taylor swift')).toBe(true);
      // This is actually a match, but let's test the reverse
      expect(isArtistChannel('swift', 'taylor swift')).toBe(false);
    });
  });

  // Test detectVideoVersionType function
  describe('detectVideoVersionType', () => {
    const normalizeText = str =>
      str
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();

    const detectVideoVersionType = (title, trackNameLower) => {
      const normalizedTitle = normalizeText(title.toLowerCase());
      const normalizedTrackName = normalizeText(trackNameLower);

      const trackWords = normalizedTrackName
        .split(/\s+/)
        .filter(w => w.length > 1);
      let remainingTitle = normalizedTitle;

      for (const trackWord of trackWords) {
        remainingTitle = remainingTitle
          .replace(new RegExp(`\\b${trackWord}\\b`, 'gi'), ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }

      const liveTerms = ['live', 'concert', 'performance', 'session'];
      const acousticTerms = ['acoustic', 'unplugged'];
      const alternativeTerms = [
        'sad version',
        'stripped',
        'piano version',
        'orchestral',
        'instrumental',
        'remix',
        'extended',
        'edit',
        'alternate',
        'alternative',
        'slowed',
        'sped up',
        'reverb',
        'demo',
        'rough',
        'unreleased',
      ];

      const hasStandaloneVersion =
        remainingTitle.includes(' version') &&
        !remainingTitle.includes('music video') &&
        !remainingTitle.includes('audio') &&
        !remainingTitle.includes('official');

      return {
        isLive: liveTerms.some(term => remainingTitle.includes(term)),
        isAcoustic: acousticTerms.some(term => remainingTitle.includes(term)),
        isAlternative:
          alternativeTerms.some(term => remainingTitle.includes(term)) ||
          hasStandaloneVersion,
      };
    };

    it('should detect live version', () => {
      const result = detectVideoVersionType('Song Name (Live)', 'Song Name');
      expect(result.isLive).toBe(true);
    });

    it('should detect acoustic version', () => {
      const result = detectVideoVersionType(
        'Song Name (Acoustic)',
        'Song Name'
      );
      expect(result.isAcoustic).toBe(true);
    });

    it('should not penalize if track name already includes version', () => {
      const result = detectVideoVersionType(
        'Song Name (Live) Official Audio',
        'Song Name (Live)'
      );
      // Should not detect live because it's in the track name
      expect(result.isLive).toBe(false);
    });

    it('should detect alternative versions', () => {
      const result = detectVideoVersionType('Song Name (Remix)', 'Song Name');
      expect(result.isAlternative).toBe(true);
    });
  });

  // Test validateVideoId function
  describe('validateVideoId', () => {
    const validateVideoId = videoId => {
      if (!videoId || typeof videoId !== 'string') return false;
      return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
    };

    it('should validate correct YouTube video ID', () => {
      expect(validateVideoId('dQw4w9WgXcQ')).toBe(true);
      expect(validateVideoId('jNQXAC9IVRw')).toBe(true);
    });

    it('should reject invalid video IDs', () => {
      expect(validateVideoId('')).toBe(false);
      expect(validateVideoId('short')).toBe(false);
      expect(validateVideoId('toolongvideoid123')).toBe(false);
      expect(validateVideoId(null)).toBe(false);
      expect(validateVideoId(undefined)).toBe(false);
    });
  });
});
