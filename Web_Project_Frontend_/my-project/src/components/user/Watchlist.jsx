import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLoggedInId } from "../../services/GetCookieValues";
import { addToWatchHistory } from "../../services/watchHistory/WatchHistory";
import { getUserWishlist, removeMovieFromWishlist } from "../../services/user/UserEngagement";
import { getPosterUrl } from "../../utils/moviePoster";

function Watchlist() {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const loadWishlist = async () => {
    try {
      setError("");
      const userId = getLoggedInId();
      const list = await getUserWishlist(userId);
      setMovies(list);
    } catch (err) {
      setError(err.message || "Failed to load watchlist.");
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const watchMovie = async (movieId) => {
    const userId = getLoggedInId();
    await addToWatchHistory(userId, movieId);
    nav("/watchMovie", { state: { id: movieId } });
  };

  const remove = async (movieId) => {
    await removeMovieFromWishlist(movieId);
    await loadWishlist();
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="mh-container py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-cyan-200 mb-2">
          My watchlist
        </h1>
        <p className="text-slate-500 text-sm mb-8">Titles you saved for later.</p>
        {error && (
          <p className="mb-6 text-red-300 bg-red-900/20 border border-red-500/25 rounded-xl px-4 py-3">{error}</p>
        )}
        {movies.length === 0 ? (
          <div className="mh-card px-8 py-14 text-center text-slate-400 max-w-md mx-auto">
            No movies yet. Add titles from Search.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {movies.map((movie) => (
              <div
                key={movie._id}
                className="group mh-card overflow-hidden border-white/10 hover:border-cyan-400/20 hover:shadow-glow-cyan transition-all duration-200"
              >
                <div
                  className="relative aspect-[2/3] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.02]"
                  style={{ backgroundImage: `url(${getPosterUrl(movie)})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>
                <div className="p-5 flex flex-col gap-4 border-t border-white/10">
                  <h2 className="font-display font-semibold text-xl text-white">{movie.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => watchMovie(movie._id)} className="mh-btn-primary px-5 py-2 rounded-xl text-sm">
                      Watch
                    </button>
                    <button type="button" onClick={() => remove(movie._id)} className="mh-btn-danger px-5 py-2 rounded-xl text-sm">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
