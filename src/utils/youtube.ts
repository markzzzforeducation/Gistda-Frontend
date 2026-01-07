/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/embed\/)([\w-]+)/,
        /(?:youtube\.com\/watch\?v=)([\w-]+)/,
        /(?:youtu\.be\/)([\w-]+)/,
        /(?:youtube\.com\/v\/)([\w-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Format seconds to human-readable duration
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')} hrs`;
    } else {
        return `${minutes}:${String(secs).padStart(2, '0')} mins`;
    }
}

/**
 * Parse ISO 8601 duration format (from YouTube API)
 * Example: PT1H22M48S -> 4968 seconds
 */
export function parseISO8601Duration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Fetch video duration from YouTube (using oEmbed API - no API key required)
 * Note: This is a fallback method. For production, use YouTube Data API v3
 */
export async function getYouTubeDuration(videoUrl: string): Promise<string | null> {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    try {
        // Using YouTube IFrame API (client-side only)
        // This creates a temporary iframe to get video info
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1`;

            document.body.appendChild(iframe);

            // Listen for YouTube player ready
            const checkPlayer = setInterval(() => {
                try {
                    const player = (iframe as any).contentWindow?.YT?.Player;
                    if (player) {
                        clearInterval(checkPlayer);
                        new player(iframe, {
                            events: {
                                onReady: (event: any) => {
                                    const duration = event.target.getDuration();
                                    document.body.removeChild(iframe);
                                    resolve(formatDuration(Math.floor(duration)));
                                }
                            }
                        });
                    }
                } catch (e) {
                    // Ignore errors during check
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkPlayer);
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                }
                resolve(null);
            }, 5000);
        });
    } catch (error) {
        console.error('Failed to fetch YouTube duration:', error);
        return null;
    }
}

/**
 * Get YouTube thumbnail URL
 */
export function getYouTubeThumbnail(videoUrl: string, quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq'): string | null {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) return null;

    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
}
