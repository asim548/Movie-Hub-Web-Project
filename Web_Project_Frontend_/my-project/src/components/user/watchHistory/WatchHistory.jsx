import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedInId } from '../../../services/GetCookieValues';
import { deleteFromWatchHistory, getWatchHistory, addToWatchHistory } from '../../../services/watchHistory/WatchHistory';
import { getPosterUrl } from '../../../utils/moviePoster';

function WatchHistory() {
    const userId = getLoggedInId();
    const nav = useNavigate();
    const [watchHistory, setWatchHistory] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchWatchHistory = async () => {
            try {
                const data = await getWatchHistory(userId, currentPage);
                setWatchHistory(data.watchHistory.movies);
                setTotalPages(data.pagination.totalPages);
            } catch (error) {
                console.error("Error fetching watch history:", error);
            }
        };

        fetchWatchHistory();
    }, [userId, currentPage]);

    const handleDelete = async (movieId) => {
        try {
            await deleteFromWatchHistory(userId, movieId);
            setWatchHistory((prev) => prev.filter((movie) => movie._id !== movieId));
        } catch (error) {
            console.error("Error deleting movie from watch history:", error);
        }
    };

    const watchAgain = async (movieId) => {
        await addToWatchHistory(userId, movieId);
        nav('/watchMovie', { state: { id: movieId } });
    };

    const MovieGrid = ({ movies }) => {
        return movies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                {movies.map((movie) => (
                    <article
                        key={movie._id}
                        className="group mh-card overflow-hidden border-white/10 hover:border-cyan-400/20 transition-all duration-200"
                    >
                        <button
                            type="button"
                            onClick={() => watchAgain(movie._id)}
                            className="block w-full text-left focus-visible:outline-none"
                        >
                            <div
                                className="relative aspect-[2/3] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                                style={{ backgroundImage: `url(${getPosterUrl(movie)})` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h3 className="font-display font-semibold text-white text-sm md:text-base leading-tight line-clamp-2">
                                        {movie.title}
                                    </h3>
                                </div>
                            </div>
                        </button>
                        <div className="p-3 border-t border-white/10 flex gap-2">
                            <button
                                type="button"
                                onClick={() => watchAgain(movie._id)}
                                className="flex-1 mh-btn-primary py-2 rounded-lg text-xs sm:text-sm"
                            >
                                Watch
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDelete(movie._id)}
                                className="mh-btn-danger py-2 px-3 rounded-lg text-xs sm:text-sm shrink-0"
                            >
                                Remove
                            </button>
                        </div>
                    </article>
                ))}
            </div>
        ) : (
            <div className="mh-card py-14 text-center text-slate-400">Nothing in your history yet.</div>
        );
    };
    
    return (
        <div className="min-h-screen pb-16">
            <div className="mh-container py-8 md:py-12">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-cyan-200">
                    Watch history
                </h1>
                <MovieGrid movies={watchHistory} />
                {totalPages > 1 && (
                    <div className="flex justify-center mt-10 gap-2 flex-wrap">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                type="button"
                                key={index + 1}
                                onClick={() => setCurrentPage(index + 1)}
                                className={`min-w-[42px] px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                    currentPage === index + 1
                                        ? 'mh-btn-primary'
                                        : 'mh-btn-secondary'
                                }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default WatchHistory;
