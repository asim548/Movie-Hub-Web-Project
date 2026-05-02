import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteMovie, getAllMoviesForAdmin, updateMovie } from "../../../services/movies/MoviesManagement";

function ApproveMovies() {
    const navigator = useNavigate();
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const getAllMoviesForaAdmin = async () => {
            const moviesResponse = await getAllMoviesForAdmin();
            setMovies(moviesResponse);
        };

        getAllMoviesForaAdmin();
    }, []);

    const updateStatusOfMovie = async (id, status) => {
        await updateMovie(id, { isApproved: status });
        const moviesResponse = await getAllMoviesForAdmin();
        setMovies(moviesResponse);
    };

    const deleteMovieByAdmin = async (id) => {
        await deleteMovie(id);
        const moviesResponse = await getAllMoviesForAdmin();
        setMovies(moviesResponse);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-violet-900 to-black text-white p-8">
            <div className="overflow-x-auto">
            <table className="min-w-full mt-4 border border-gray-300">
                <thead>
                    <tr className="bg-gradient-to-r from-violet-800 to-black text-gray-100">
                        <th className="border border-gray-300 p-2 bg-black text-center">Title</th>
                        <th className="border border-gray-300 p-2 bg-black text-center">Approved</th>
                        <th className="border border-gray-300 p-2 bg-black text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {movies.map((movie) => (
                        <tr key={movie._id} className="border-b border-gray-300">
                            <td className="border border-gray-300 p-2 text-center">{movie.title}</td>
                            <td className="border border-gray-300 p-2 text-center">{movie.isApproved ? 'True' : 'False'}</td>
                            <td className="border border-gray-300 p-2 flex flex-wrap justify-evenly gap-2">
                                <button 
                                    onClick={() => updateStatusOfMovie(movie._id, !movie.isApproved)}
                                    className="bg-violet-700 hover:bg-violet-600 text-white px-4 py-2 rounded-lg transition duration-200 w-full sm:w-auto"
                                >
                                    {movie.isApproved ? 'Disapprove' : 'Approve'}
                                </button>
                                <button 
                                    onClick={() => deleteMovieByAdmin(movie._id)}
                                    className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition duration-200 w-full sm:w-auto"
                                >
                                    Delete
                                </button>
                                <button 
                                    onClick={() => navigator('/watchMovie', { state: { id: movie._id } })}
                                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition duration-200 w-full sm:w-auto"
                                >
                                    Watch
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default ApproveMovies;
