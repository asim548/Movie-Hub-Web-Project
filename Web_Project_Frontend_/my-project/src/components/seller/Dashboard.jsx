import React, { useEffect, useState } from 'react';
import { getSellerDashboard } from '../../services/seller/SellerManagement';
import { useNavigate } from 'react-router-dom';
import { getPosterUrl } from '../../utils/moviePoster';

function SellerDashboard() {
    const [dashboardData, setDashboardData] = useState({
        totalMovies: 0,
        approvedMovies: 0,
        notApprovedMovies: 0,
        totalViews: 0,
        totalEarning: 0,
        totalPaid: 0,
        movies: [],
    });

    const nav = useNavigate();

    useEffect(() => {
        const getSellerDashboardForS = async () => {
            const rsp = await getSellerDashboard();
            setDashboardData(rsp);
        };

        getSellerDashboardForS();
    }, []);

    const watchMovie = (movieId) => {
        nav('/watchMovie', { state: { id: movieId } });
    };

    return (
        <div className="min-h-screen pb-16">
            <div className="mh-container py-8 md:py-12">
                <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-cyan-200">
                    Seller dashboard
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12">
                    <StatCard title="Total movies" value={dashboardData.totalMovies} />
                    <StatCard title="Approved" value={dashboardData.approvedMovies} />
                    <StatCard title="Pending approval" value={dashboardData.notApprovedMovies} />
                    <StatCard title="Total views" value={dashboardData.totalViews} />
                    <StatCard title="Total earnings" value={`$${dashboardData.totalEarning}`} />
                    <StatCard title="Total paid" value={`$${dashboardData.totalPaid}`} />
                </div>

                <h2 className="mh-section-title text-center mb-8">Your titles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {dashboardData.movies && dashboardData.movies.length > 0 ? (
                        dashboardData.movies.map((movie) => (
                            <MovieCard key={movie._id} movie={movie} onWatch={watchMovie} />
                        ))
                    ) : (
                        <p className="text-slate-500 text-center col-span-full mh-card py-12">No movies yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="mh-card p-5 md:p-6 text-center border-cyan-500/10 hover:border-cyan-400/20 transition-colors">
            <h2 className="text-xs uppercase tracking-wider text-slate-500 mb-2">{title}</h2>
            <p className="font-display text-2xl md:text-3xl font-bold text-white">{value}</p>
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
                <h2 className="font-display font-semibold text-white">{movie.title}</h2>
                <p className="text-sm text-slate-400 mt-1">Views: {movie.views}</p>
                <p className="text-sm text-cyan-200/80">Earnings: ${(movie.views / 10).toFixed(2)}</p>
            </div>
        </button>
    );
}

export default SellerDashboard;
