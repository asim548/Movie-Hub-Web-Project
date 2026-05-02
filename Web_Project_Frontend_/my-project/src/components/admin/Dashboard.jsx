import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../../services/admin/AdminDashboard';
import { addToWatchHistory } from '../../services/watchHistory/WatchHistory';
import { getLoggedInId } from '../../services/GetCookieValues';
import { useNavigate } from 'react-router-dom';
import { getPosterUrl } from '../../utils/moviePoster';

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const rsp = await getAdminDashboard();
        setDashboardData(rsp);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  if (!dashboardData) {
    return (
      <div className="mh-container py-24 flex justify-center">
        <div className="mh-card px-10 py-8 animate-pulse text-slate-400">Loading dashboard…</div>
      </div>
    );
  }

  const watchMovie = async (movieId) => {
    const userId = getLoggedInId();
    await addToWatchHistory(userId, movieId);
    nav('/watchMovie', { state: { id: movieId } });
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="mh-container py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-cyan-200">
          Admin dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-12">
          <StatCard title="Total users" value={dashboardData.totalUsers} />
          <StatCard title="Total sellers" value={dashboardData.totalSellers} />
          <StatCard title="Total movies" value={dashboardData.totalMovies} />
        </div>

        <h2 className="mh-section-title text-center mb-8">Top popular movies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {dashboardData.popularMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} onWatch={watchMovie} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="mh-card p-6 text-center border-violet-500/15 hover:border-cyan-400/20 transition-colors">
      <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">{title}</h2>
      <p className="font-display text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

export function MovieCard({ movie, onWatch }) {
  return (
    <button
      type="button"
      onClick={() => onWatch(movie._id)}
      className="group mh-card overflow-hidden text-left border-white/10 hover:border-cyan-400/25 hover:shadow-glow-cyan transition-all duration-200"
    >
      <div
        className="relative aspect-[2/3] bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
        style={{ backgroundImage: `url(${getPosterUrl(movie)})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
      </div>
      <div className="p-4 border-t border-white/10">
        <h2 className="font-display font-semibold text-white leading-snug">{movie.title}</h2>
        {movie.releaseDate && (
          <p className="text-xs text-slate-500 mt-2">{String(movie.releaseDate).slice(0, 10)}</p>
        )}
      </div>
    </button>
  );
}

export default AdminDashboard;
