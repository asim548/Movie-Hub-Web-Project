import React, { useEffect, useState } from "react";
import { deleteMovie, getAllMoviesForSeller } from "../../../services/movies/MoviesManagement";
import { useNavigate } from "react-router-dom";

function SellerMovieManagement() {
  const navigator = useNavigate();
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const getAllMoviesForSpecificSeller = async () => {
      try {
        const fetchedMovies = await getAllMoviesForSeller();
        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    getAllMoviesForSpecificSeller();
  }, []);

  const uploadMovie = () => {
    navigator("/seller/movie/upload");
  };

  const deleteMovieForSeller = async (id) => {
    await deleteMovie(id);
    // Refresh the movie list after deletion
    const getAllMoviesForSpecificSeller = async () => {
      try {
        const fetchedMovies = await getAllMoviesForSeller();
        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    getAllMoviesForSpecificSeller();
  };

  const updateMovieForSeller = (id) => {
    navigator('/seller/movie/update', { state: { id: id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 to-black text-white p-8">
      <button
        onClick={uploadMovie}
        className="bg-violet-700 hover:bg-violet-600 text-white p-2 rounded-lg mt-2 transition duration-200"
      >
        Upload Movie
      </button>

      <table className="min-w-full mt-4 border border-gray-300">
        <thead>
          <tr className="bg-gradient-to-r from-violet-800 to-black text-gray-100">
            <th className="border border-gray-300 p-2 bg-black text-sm sm:text-base">Title</th>
            <th className="border border-gray-300 p-2 bg-black text-sm sm:text-base">Approved</th>
            <th className="border border-gray-300 p-2 bg-black text-sm sm:text-base">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr key={movie._id} className="border-b border-gray-300">
              <td className="border border-gray-300 p-2 text-center text-sm sm:text-base">{movie.title}</td>
              <td className="border border-gray-300 p-2 text-center text-sm sm:text-base">{movie.isApproved ? 'True' : 'False'}</td>
              <td className="border border-gray-300 p-2 flex flex-wrap justify-evenly space-x-2">
                <button 
                  onClick={() => updateMovieForSeller(movie._id)}
                  className="bg-violet-700 hover:bg-violet-600 text-white px-2 py-1 rounded-lg transition duration-200"
                >
                  Update
                </button>
                <button 
                  onClick={() => deleteMovieForSeller(movie._id)}
                  className="bg-red-600 hover:bg-red-500 text-white px-2 py-1 rounded-lg transition duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SellerMovieManagement;
