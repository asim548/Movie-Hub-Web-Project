import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateMovie, uploadCoverPhoto } from "../../../services/movies/MoviesManagement";

function UpdateMovieForSeller() {
    const location = useLocation();
    const id = location.state?.id; // Use location.state to get the id
    const navigator = useNavigate();
    
    const [movieDetails, setMovieDetails] = useState({
        title: "",
        genre: [],
        releaseDate: "",
        runtime: "",
        popularity: "",
        ageRating: "",
        parentalGuidance: "",
        countryOfOrigin: "",
        Language: "",
    });
    const [coverPhoto, setCoverPhoto] = useState(null);

    // Fetch existing movie details
    useEffect(() => {
        console.log(location);
        console.log(id);
        // Fetch movie details by id and populate movieDetails state here
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault(); // Prevent default form submission
        try {
            await updateMovie(id, movieDetails);

            // If a cover photo is selected, upload it
            if (coverPhoto) {
                await uploadCoverPhotoToServer(id, coverPhoto);
            }

            navigator("/seller/MovieManagement");
        } catch (error) {
            console.error("Error updating movie:", error);
        }
    };

    const uploadCoverPhotoToServer = async (movieId, file) => {
        const formData = new FormData();
        formData.append("file", file); 
    
        try {
            const response = await uploadCoverPhoto(movieId, formData);
            console.log('Cover photo uploaded successfully:', response.data);
        } catch (error) {
            console.error("Error uploading cover photo:", error);
        }
    };

    const handleCoverPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverPhoto(file); // Set the selected file in state
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-900 to-black py-8">
            <div className="bg-black p-6 rounded-lg shadow-lg w-full max-w-md sm:max-w-lg lg:max-w-xl">
                <h2 className="text-2xl font-bold text-violet-200 text-center">Update Movie</h2>
                <form onSubmit={handleUpdate} className="mt-4 space-y-4">
                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Cover Photo:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverPhotoChange}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Title:</label>
                        <input
                            type="text"
                            name="title"
                            value={movieDetails.title}
                            onChange={(e) => setMovieDetails({ ...movieDetails, title: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Genre (comma-separated):</label>
                        <input
                            type="text"
                            name="genre"
                            value={movieDetails.genre.join(",")}
                            onChange={(e) => setMovieDetails({ ...movieDetails, genre: e.target.value.split(",") })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Release Date:</label>
                        <input
                            type="date"
                            name="releaseDate"
                            value={movieDetails.releaseDate}
                            onChange={(e) => setMovieDetails({ ...movieDetails, releaseDate: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray- 200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Runtime (in minutes):</label>
                        <input
                            type="number"
                            name="runtime"
                            value={movieDetails.runtime}
                            onChange={(e) => setMovieDetails({ ...movieDetails, runtime: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Popularity:</label>
                        <input
                            type="number"
                            name="popularity"
                            value={movieDetails.popularity}
                            onChange={(e) => setMovieDetails({ ...movieDetails, popularity: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Age Rating:</label>
                        <input
                            type="text"
                            name="ageRating"
                            value={movieDetails.ageRating}
                            onChange={(e) => setMovieDetails({ ...movieDetails, ageRating: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Parental Guidance:</label>
                        <input
                            type="text"
                            name="parentalGuidance"
                            value={movieDetails.parentalGuidance}
                            onChange={(e) => setMovieDetails({ ...movieDetails, parentalGuidance: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Country of Origin:</label>
                        <input
                            type="text"
                            name="countryOfOrigin"
                            value={movieDetails.countryOfOrigin}
                            onChange={(e) => setMovieDetails({ ...movieDetails, countryOfOrigin: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 text-gray-200">Language:</label>
                        <input
                            type="text"
                            name="Language"
                            value={movieDetails.Language}
                            onChange={(e) => setMovieDetails({ ...movieDetails, Language: e.target.value })}
                            className="border p-2 rounded w-full bg-violet-900 text-gray-200 border-gray-600"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg mt-4 transition duration-200"
                    >
                        Update Movie
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UpdateMovieForSeller;
