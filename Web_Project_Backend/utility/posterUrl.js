const cloudinary = require('cloudinary').v2;

const CLOUDINARY_ENABLED = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (CLOUDINARY_ENABLED) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

function getDefaultPosterUrl(title = 'movie') {
    const seed = String(title || 'movie')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'movie';
    return `https://picsum.photos/seed/${seed}/400/600`;
}

/**
 * Best-effort public_id from a Cloudinary video delivery URL with no inline transformations.
 */
function extractPublicIdFromCloudinaryVideoUrl(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.includes('res.cloudinary.com') || !url.includes('/video/upload/')) return null;
    try {
        let pathPart = url.split('/video/upload/')[1]?.split('?')[0];
        if (!pathPart) return null;
        pathPart = pathPart.replace(/^v\d+\//, '');
        if (pathPart.includes(',')) return null;
        if (!/\.(mp4|webm|mov|m4v|mkv)$/i.test(pathPart)) return null;
        return pathPart.replace(/\.[^/.]+$/, '');
    } catch {
        return null;
    }
}

function buildVideoPosterFromPublicId(publicId) {
    if (!CLOUDINARY_ENABLED || !publicId) return null;
    try {
        return cloudinary.url(publicId, {
            resource_type: 'video',
            format: 'jpg',
            secure: true,
            transformation: [
                { width: 400, height: 600, crop: 'fill', gravity: 'auto' },
                { start_offset: 1 },
            ],
        });
    } catch {
        return null;
    }
}

/**
 * Prefer a frame from the hosted video. Keep explicit Cloudinary image posters (seller uploads).
 */
function resolveMoviePosterPhoto(ret) {
    const photo = ret.photo;
    if (photo && String(photo).includes('/image/upload/')) {
        return photo;
    }
    const pid = ret.videoCloudinaryPublicId || extractPublicIdFromCloudinaryVideoUrl(ret.filePath);
    const derived = buildVideoPosterFromPublicId(pid);
    if (derived) return derived;
    return photo || getDefaultPosterUrl(ret.title);
}

module.exports = {
    CLOUDINARY_ENABLED,
    getDefaultPosterUrl,
    extractPublicIdFromCloudinaryVideoUrl,
    buildVideoPosterFromPublicId,
    resolveMoviePosterPhoto,
};
