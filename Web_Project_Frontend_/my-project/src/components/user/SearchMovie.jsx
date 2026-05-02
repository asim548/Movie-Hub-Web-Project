import React, { useState } from "react";
import { filterMovies, getSimilarGenreMovies } from '../../services/movies/MoviesManagement';
import { getLoggedInId } from '../../services/GetCookieValues';
import { addToWatchHistory } from '../../services/watchHistory/WatchHistory';
import { addMovieToWishlist } from "../../services/user/UserEngagement";
import { useNavigate } from 'react-router-dom';
import { getPosterUrl } from '../../utils/moviePoster';

function SearchMovie() {
    const [searchValue, setSearchValue] = useState('');
    const [foundMovies, setFoundMovies] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState('');
    const [filters, setFilters] = useState({
        genre: '',
        language: '',
        ageRating: '',
        minRating: '',
    });
   
    const nav = useNavigate();

    const buildFilterPayload = () => {
        const minRaw = filters.minRating;
        const minNum = minRaw === '' || minRaw == null ? null : Number(minRaw);
        return {
            ...(searchValue.trim() ? { title: searchValue.trim() } : {}),
            ...(filters.genre.trim() ? { genre: [filters.genre.trim()] } : {}),
            ...(filters.language.trim() ? { language: filters.language.trim() } : {}),
            ...(filters.ageRating.trim() ? { ageRating: filters.ageRating.trim() } : {}),
            ...(minNum != null && !Number.isNaN(minNum) ? { minRating: minNum } : {}),
        };
    };

    const hasAnySearchCriterion = (payload) => Object.keys(payload).length > 0;

    const runUnifiedSearch = async () => {
        const payload = buildFilterPayload();
        if (!hasAnySearchCriterion(payload)) {
            setHasSearched(false);
            setFoundMovies([]);
            setSimilarMovies([]);
            setSearchError('');
            return;
        }
        setHasSearched(true);
        setSearchError('');
        setIsSearching(true);
        try {
            const response = await filterMovies(payload);
            const list = Array.isArray(response) ? response : [];
            setFoundMovies(list);
            const titleQuery = searchValue.trim();
            if (titleQuery && list.length > 0) {
                try {
                    const rsp = await getSimilarGenreMovies(list[0]._id);
                    setSimilarMovies(Array.isArray(rsp) ? rsp : []);
                } catch {
                    setSimilarMovies([]);
                }
            } else {
                setSimilarMovies([]);
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                'Search failed. Check that the backend is running and you are logged in.';
            setSearchError(typeof msg === 'string' ? msg : 'Search failed.');
            setFoundMovies([]);
            setSimilarMovies([]);
        } finally {
            setIsSearching(false);
        }
    };

    const watchMovie = async (movieId) => {
        const userId = getLoggedInId(); 
        await addToWatchHistory(userId, movieId);
        nav('/watchMovie', { state: { id: movieId } });
    };

    const addWishlist = async (movieId) => {
        await addMovieToWishlist(movieId);
        alert("Added to watchlist");
    };

    return (
        <div className="min-h-screen pb-16">
            <div className="mh-container py-8 md:py-12 flex flex-col items-center">
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-cyan-200 mb-8 text-center">
                    Search movies
                </h1>
                <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && runUnifiedSearch()}
                        className="mh-input flex-1 py-3.5"
                        placeholder="Exact movie title…"
                    />
                    <button
                        type="button"
                        onClick={runUnifiedSearch}
                        disabled={isSearching}
                        className="mh-btn-primary px-8 py-3.5 rounded-xl shrink-0 disabled:opacity-60"
                    >
                        {isSearching ? 'Searching…' : 'Search'}
                    </button>
                </div>
                <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <input
                        className="mh-input"
                        placeholder="Genre (optional)"
                        value={filters.genre}
                        onChange={(e) => setFilters((p) => ({ ...p, genre: e.target.value }))}
                    />
                    <input
                        className="mh-input"
                        placeholder="Language (optional)"
                        value={filters.language}
                        onChange={(e) => setFilters((p) => ({ ...p, language: e.target.value }))}
                    />
                    <input
                        className="mh-input"
                        placeholder="Age rating (optional)"
                        value={filters.ageRating}
                        onChange={(e) => setFilters((p) => ({ ...p, ageRating: e.target.value }))}
                    />
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="1"
                            max="5"
                            className="mh-input"
                            placeholder="Min rating (optional)"
                            value={filters.minRating}
                            onChange={(e) => setFilters((p) => ({ ...p, minRating: e.target.value }))}
                        />
                        <button
                            type="button"
                            onClick={runUnifiedSearch}
                            disabled={isSearching}
                            className="mh-btn-secondary px-4 disabled:opacity-60"
                        >
                            {isSearching ? '…' : 'Filter'}
                        </button>
                    </div>
                </div>

                {searchError ? (
                    <p className="mt-8 w-full max-w-5xl text-center text-rose-300 text-sm px-4" role="alert">
                        {searchError}
                    </p>
                ) : null}

                <div className="mt-8 w-full max-w-5xl space-y-14">
                    {foundMovies.length > 0 ? (
                        <section className="w-full">
                            <h2 className="mh-section-title mb-6 pb-2 border-b border-white/10">Results</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {foundMovies.map((movie) => (
                                    <MovieCard key={movie._id} movie={movie} onWatch={watchMovie} onAddWishlist={addWishlist} />
                                ))}
                            </div>
                        </section>
                    ) : (
                        <p className="text-center text-slate-400 text-lg py-8">
                            {hasSearched
                                ? 'No movies matched. Try different words or filters.'
                                : 'Type a title (or optional filters), then press Search or Enter — typing alone does not run the search.'}
                        </p>
                    )}

                    {similarMovies.length > 0 ? (
                        <section className="w-full">
                            <h2 className="mh-section-title mb-6 pb-2 border-b border-white/10">Similar genres</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {similarMovies.map((movie) => (
                                    <MovieCard key={movie._id} movie={movie} onWatch={watchMovie} onAddWishlist={addWishlist} />
                                ))}
                            </div>
                        </section>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function MovieCard({ movie, onWatch, onAddWishlist }) {
    return (
        <div className="group mh-card overflow-hidden flex flex-col border-white/10 hover:border-cyan-400/25 hover:shadow-glow-cyan transition-all duration-200">
            <div
                className="relative aspect-[2/3] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${getPosterUrl(movie)})` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>
            <div className="p-4 flex flex-col flex-1 gap-3 border-t border-white/10 bg-black/20">
                <div>
                    <h3 className="font-display font-semibold text-lg text-white leading-snug">{movie.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {movie.views != null ? `${movie.views} views` : ''}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                    <button
                        type="button"
                        onClick={() => onWatch(movie._id)}
                        className="mh-btn-primary text-sm px-4 py-2 rounded-lg"
                    >
                        Watch
                    </button>
                    <button
                        type="button"
                        onClick={() => onAddWishlist(movie._id)}
                        className="mh-btn-secondary text-sm px-4 py-2 rounded-lg"
                    >
                        + Watchlist
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SearchMovie;
