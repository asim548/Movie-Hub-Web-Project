import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMoviesForSeller } from '../../../services/movies/MoviesManagement';
import { getPosterUrl } from '../../../utils/moviePoster';

function BrowseMovies() {
    const [movies, setMovies] = useState([]);
    const [query, setQuery] = useState('');
    const [appliedQuery, setAppliedQuery] = useState('');
    const nav = useNavigate();
  
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const fetchedMovies = await getAllMoviesForSeller();
                setMovies(fetchedMovies);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };
  
        fetchMovies();
    }, []);

    const filteredMovies = useMemo(() => {
        const term = appliedQuery.trim().toLowerCase();
        if (!term) return movies;
        return movies.filter((movie) => String(movie.title || '').toLowerCase().includes(term));
    }, [movies, appliedQuery]);
  
    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-900 to-black flex flex-col items-center py-8">
            <h1 className="text-4xl font-bold text-violet-200 mb-8">Browse Movies</h1>

            <div className="w-full max-w-2xl px-4 mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setAppliedQuery(query)}
                        placeholder="Search by movie title..."
                        className="mh-input flex-1"
                    />
                    <button
                        type="button"
                        onClick={() => setAppliedQuery(query)}
                        className="mh-btn-primary px-6 py-3"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 w-full max-w-7xl">
                {filteredMovies.map((movie) => (
                    <MovieCard movie={movie} key={movie._id} />
                ))}
            </div>
            {filteredMovies.length === 0 && (
                <p className="text-slate-300 mt-8">No movies found for "{appliedQuery}".</p>
            )}
        </div>
    );
}

function MovieCard({ movie }) {
    const nav = useNavigate();
  
    const watchMovie = (id) => {
        nav('/watchMovie', { state: { id: id } });
    }
  
    return (
        <div 
            onClick={() => watchMovie(movie._id)}
            className="relative bg-cover bg-center rounded-lg shadow-lg overflow-hidden min-h-[300px] max-h-[400px] transition duration-300 ease-in-out transform hover:scale-105"
            style={{
                backgroundImage: `url(${getPosterUrl(movie)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '300px',
                maxHeight: '300px',
            }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="relative z-10 p-4 flex flex-col justify-end h-full">
                <h2 className="text-lg font-bold text-white">{movie.title}</h2>
                <p className="text-sm text-gray-300">{movie.releaseDate}</p>
            </div>
        </div>
    );
}

export default BrowseMovies;
