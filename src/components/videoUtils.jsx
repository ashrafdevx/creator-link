export const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = new URL(url).searchParams.get('v');
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = new URL(url).pathname.substring(1);
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('vimeo.com/')) {
            const videoId = new URL(url).pathname.match(/\d+/)[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        // Add TikTok support
        if (url.includes('tiktok.com/')) {
            // TikTok URLs are tricky - we'll return the original URL 
            // since TikTok embeds require special handling
            return url;
        }
    } catch (error) {
        console.error("Error parsing video URL:", url, error);
        return null;
    }
    return null;
};

export const getYoutubeThumbnail = (url) => {
    if (!url) return null;
    try {
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = new URL(url).searchParams.get('v');
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = new URL(url).pathname.substring(1);
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
        }
        // Add TikTok thumbnail support - use a placeholder for now
        if (url.includes('tiktok.com/')) {
            return 'https://via.placeholder.com/480x270/000000/FFFFFF?text=TikTok+Video';
        }
    } catch (error) {
        console.error("Error getting video thumbnail:", url, error);
        return null;
    }
    return null;
};