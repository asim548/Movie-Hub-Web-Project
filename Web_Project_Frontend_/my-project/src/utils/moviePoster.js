export function getFallbackPoster(movie = {}) {
    const seedBase = movie.title || movie._id || 'movie';
    const seed =
        String(seedBase)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'movie';
    return `https://picsum.photos/seed/${seed}/400/600`;
}

export function getPosterUrl(movie = {}) {
    return movie.photo || getFallbackPoster(movie);
}
