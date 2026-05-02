import React, { useState } from "react";
import { uploadMovieForSeller } from "../../../services/movies/MoviesManagement";
import { getLoggedInId } from "../../../services/GetCookieValues";

function UploadMovieForSeller() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);
    formData.append('loggedInId', getLoggedInId());

    try {
      await uploadMovieForSeller(formData);
      alert("Movie uploaded successfully!"); // Notify the user
    } catch (error) {
      console.error("Error uploading movie:", error);
      alert("Failed to upload movie.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-900 to-black py-8">
      <div className="bg-black p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-violet-200 text-center mb-4">Upload Movie</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-200 mb-2">Movie Name</label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="border border-gray-600 p-2 rounded w-full bg-violet-900 text-gray-200"
              required
            />
          </div>
          <div>
            <label className="block text-gray-200 mb-2">Browse Movie</label>
            <input
              type="file"
              onChange={handleFile}
              className="border border-gray-600 p-2 rounded w-full bg-violet-900 text-gray-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-violet-700 hover:bg-violet-600 text-white py-2 rounded-lg transition duration-200"
          >
            Upload
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadMovieForSeller;
