const Person = require("../persons/Person");
const Review = require("../reviews/Reviews");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Movie = require("./Movie");
const { AdminSeller, User } = require("../adminSellerUser/AdminSellerUser");
const sendMail = require("../notification/EmailNotifications");
const cloudinary = require('cloudinary').v2;
const {
    CLOUDINARY_ENABLED,
    getDefaultPosterUrl,
    buildVideoPosterFromPublicId,
} = require('../../utility/posterUrl');

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const movieStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});

const coverPhotoStorage = multer.memoryStorage();

const uploadMovieMiddleware = multer({ storage: movieStorage }).single('file'); 
const uploadCoverPhotoMiddleware = multer({ storage: coverPhotoStorage }).single('file'); 

const isRemoteFile = (value = "") => /^https?:\/\//i.test(value);

const getLocalMoviePath = (moviePath) => path.join(__dirname, '..', '..', moviePath);

const isDeliverableEmail = (email = '') => {
    const value = String(email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return false;
    }
    // Skip obvious local/test domains to avoid predictable bounces.
    if (value.endsWith('@movie.com') || value.endsWith('.local') || value.endsWith('@example.com')) {
        return false;
    }
    return true;
};

const uploadImageBuffer = async (buffer, movieId) => {
    if (!CLOUDINARY_ENABLED) {
        throw new Error("Cloudinary is not configured.");
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "movies",
                public_id: `movie_${movieId}`,
                overwrite: true,
                resource_type: "image",
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        uploadStream.end(buffer);
    });
};

// Function to handle movie cover photo upload
const uploadMovieCoverPhoto = async (req, res) => {
    try {
        // Middleware to handle file upload
        await uploadCoverPhotoMiddleware(req, res, (err) => {
            if (err) {
                console.error("Multer error:", err.message);
                return res.status(400).json({ message: "Error processing the file upload." });
            }
        });

        // Ensure a file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Cover photo is required." });
        }

        const movieId = req.params.id;
        const movie = await Movie.findById(movieId);

        // Check if the movie exists
        if (!movie) {
            return res.status(404).json({ message: "Movie not found." });
        }

        if (!CLOUDINARY_ENABLED) {
            return res.status(500).json({ message: "Cloudinary is not configured on the server." });
        }

        const uploadResult = await uploadImageBuffer(req.file.buffer, movieId);
        movie.movieCoverPhoto = uploadResult;
        movie.photo = uploadResult;
        // console.log("1",movie.movieCoverPhoto, "asdaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        // Save the updated movie document
        const updatedMovie = await movie.save();

        console.log("Updated Movie URL: ", updatedMovie)

        // Respond with the updated movie details
        res.status(200).json({
            message: "Cover photo uploaded and URL saved successfully.",
            data: updatedMovie,
        });
    } catch (error) {
        console.error("Error uploading cover photo:", error.message);
        res.status(500).json({ message: "Internal server error." });
    }
};

const uploadMovie = async (req, res) => {
    try {
        console.log("1")
        if (!req.file) {
            return res.status(400).json({ message: 'File is required for upload.' });
        }
        
        let uploadedFilePath = req.file.path;
        let videoCloudinaryPublicId;

        if (CLOUDINARY_ENABLED) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path, {
                folder: "movies/videos",
                public_id: `movie_file_${Date.now()}`,
                resource_type: "video",
                overwrite: true,
            });

            uploadedFilePath = uploadResult.secure_url;
            videoCloudinaryPublicId = uploadResult.public_id;

            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }

        const posterFromVideo =
            videoCloudinaryPublicId && buildVideoPosterFromPublicId(videoCloudinaryPublicId);

        const movieData = {
            isApproved:false,
            sellerId: req.body.loggedInId, 
            title: req.body.fileName, 
            filePath: uploadedFilePath,
            averageRating:0,
            photo: posterFromVideo || getDefaultPosterUrl(req.body.fileName),
            ...(videoCloudinaryPublicId ? { videoCloudinaryPublicId } : {}),
        };

        const newMovie = new Movie(movieData);
        await newMovie.save();

        const users = await User.find({}, 'email');
        const recipientEmails = [...new Set(users.map((user) => user.email).filter(isDeliverableEmail))];

        await Promise.allSettled(
            recipientEmails.map((email) =>
                sendMail(
                    email,
                    `New Movie Added -> ${newMovie.title || req.body.fileName || 'Movie'}`,
                    'A new movie has been added to the platform'
                )
            )
        );

        return res.status(201).json({
            message: 'File and metadata uploaded successfully.',
            data: newMovie,
        });
    } catch (error) {
        console.error('Error uploading file:', error.message);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};


const streamMovie = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).send('Movie not found');

        if (isRemoteFile(movie.filePath)) {
            return res.redirect(movie.filePath);
        }

        const filePath = getLocalMoviePath(movie.filePath);
        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }

        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

            const chunkSize = end - start + 1;
            const file = fs.createReadStream(filePath, { start, end });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': 'video/mp4',
            });

            file.pipe(res);
        } else {
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/mp4',
            });

            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        res.status(500).send({ message: 'Error streaming movie' });
    }
};


const getAllForSeller = async (req, res) => {
    let id = req.params.id;
    try {
        console.log(id);
        const movies = await Movie.find({sellerId: id} ).select('-movieCoverPhoto')
           
            .populate('director')
            .populate('cast')
            
        console.log(movies) 


        res.status(200).json({

            movies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getTopTenMovies = async (req, res) => {
   
    try {
        const movies = await Movie.find({isApproved:true} ).select('-movieCoverPhoto')
        .sort({popularity:-1})
        .limit(10);
           
        console.log(movies) 


        res.status(200).json({

            movies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMovies = async (req, res) => {
   
    try {
        const movies = await Movie.find({isApproved:true} ).select('-movieCoverPhoto')
        .sort({popularity:-1})
        .limit(10);
           
        console.log(movies) 


        res.status(200).json({

            movies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMoviesForAdmin = async (req, res) => {
   console.log("HEHE")
    try {
        const movies = await Movie.find().select('-movieCoverPhoto')
            // .populate('sellerId')
           
        console.log(movies) 


        res.status(200).json({

            movies
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMoviesByFilter = async (req, res) => {
    try {
        const rawPayload = req.method === 'GET' ? req.query : req.body;
        const payload = rawPayload && typeof rawPayload === 'object' ? rawPayload : {};
        const title = payload.title ?? payload.Title;
        const {
            genre,
            director,
            cast,
            minRating,
            maxRating,
            minPopularity,
            maxPopularity,
            releaseYear,
            releaseDecade,
            countryOfOrigin,
            language,
            ageRating,
            keywords
        } = payload;

        const movieSet = new Set();

        // Helper function to add movies to the set
        const addMoviesToSet = (movies) => {
            movies.forEach(movie => movieSet.add(movie._id.toString()));
        };

        // Fetch movies by title: exact match only (case-insensitive), not substring
        const titleTrimmed = title != null ? String(title).trim() : '';
        if (titleTrimmed) {
            const safe = escapeRegex(titleTrimmed);
            const movies = await Movie.find({
                isApproved: true,
                title: { $regex: `^${safe}$`, $options: 'i' },
            });
            addMoviesToSet(movies);
        }

        if (genre != null && genre !== '') {
            const genreList = Array.isArray(genre) ? genre : [genre];
            const genreFiltered = genreList.map((g) => String(g).trim()).filter(Boolean);
            if (genreFiltered.length > 0) {
                const movies = await Movie.find({ isApproved: true, genre: { $in: genreFiltered } });
                addMoviesToSet(movies);
            }
        }

        if (director) {
            const movies = await Movie.find({isApproved:true, director });
            addMoviesToSet(movies);
        }

        if (cast != null && cast !== '') {
            const castList = Array.isArray(cast) ? cast : [cast];
            const castFiltered = castList.filter(Boolean);
            if (castFiltered.length > 0) {
                const movies = await Movie.find({ isApproved: true, cast: { $in: castFiltered } });
                addMoviesToSet(movies);
            }
        }

        // Filter by exact rating
        const minR = minRating != null && minRating !== '' ? Number(minRating) : NaN;
        if (Number.isFinite(minR)) {
            const movies = await Movie.find({ isApproved:true,averageRating: { $gt: minR } });
            addMoviesToSet(movies);
        }
        const maxR = maxRating != null && maxRating !== '' ? Number(maxRating) : NaN;
        if (Number.isFinite(maxR)) {
            const movies = await Movie.find({ isApproved:true,averageRating: { $lt: maxR } });
            addMoviesToSet(movies);
        }

        // Filter by exact popularity
        if (maxPopularity || minPopularity) {
            const movies = await Movie.find({ isApproved:true,popularity: { $lt: maxPopularity, $gt: minPopularity } });
            addMoviesToSet(movies);
        }


        // Filter by release year
        if (releaseYear) {
            const movies = await Movie.find({isApproved:true,
                releaseDate: {
                    $gte: new Date(`${releaseYear}-01-01`),
                    $lte: new Date(`${releaseYear}-12-31`)
                }
            });
            addMoviesToSet(movies);
        }

        // Filter by release decade
        if (releaseDecade) {
            const startYear = parseInt(releaseDecade, 10);
            const endYear = startYear + 9;

            const movies = await Movie.find({isApproved:true,
                releaseDate: {
                    $gte: new Date(`${startYear}-01-01`),
                    $lte: new Date(`${endYear}-12-31`)
                }
            });
            addMoviesToSet(movies);
        }

        // Filter by country of origin
        if (countryOfOrigin) {
            const movies = await Movie.find({ isApproved:true,countryOfOrigin });
            addMoviesToSet(movies);
        }

        // Filter by language
        if (language) {
            const movies = await Movie.find({ isApproved:true,Language: language });
            addMoviesToSet(movies);
        }

        if (ageRating) {
            const movies = await Movie.find({ isApproved:true, ageRating });
            addMoviesToSet(movies);
        }

        // Filter by keywords in synopsis
        if (keywords != null && keywords !== '') {
            const kwList = Array.isArray(keywords) ? keywords : [keywords];
            const kwFiltered = kwList.map((k) => String(k).trim()).filter(Boolean);
            if (kwFiltered.length > 0) {
                const movies = await Movie.find({ isApproved:true, keywords: { $in: kwFiltered } });
                addMoviesToSet(movies);
            }
        }

        const movieIds = Array.from(movieSet);
        const uniqueMovies = await Movie.find({ isApproved: true, _id: { $in: movieIds } })
            .populate('director')
            .populate('cast');

        res.status(200).json(uniqueMovies);
    } catch (error) {
        res.status(500).json({ data: null, message: error.message });
    }
};

const getMovieDetailsById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id)
            .populate('director')
            .populate('cast');
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        res.status(200).json(movie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTopMoviesByGenre = async (req, res) => {

   
    const { genre } = req.body;

    if (!genre) {
        return res.status(400).json({ message: 'Genre is required for this query' });
    }
    const movies = await Movie.find({ genre ,isApproved:true}).select('-movieCoverPhoto')
        .sort({ averageRating: -1 })
        .limit(10)
        .populate('director')
        .populate('cast')

    res.status(200).json(movies);
}

const getTopMoviesOfTheMonth = async (req, res) => {
    try {

       

        const movies = await Movie.find({
            releaseDate: {
                $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
                $gt: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            },
            isApproved:true
        }).select('-movieCoverPhoto')
            .sort({ averageRating: -1, popularity: -1 })
            .limit(10)
            .populate('director')
            .populate('cast')
        

        res.status(200).json(movies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getMostPopularMovies = async (req, res) => {
    try {

       

        const popularMovies = await Movie.find({isApproved:true}).select('-movieCoverPhoto')
            .sort({ popularity: -1 });

        res.status(200).json(popularMovies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMovieById = async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        console.log(movie)
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }
        movie.views+=1;

        const seller = await AdminSeller.findById(movie.sellerId);
        
        // seller.payOnViews+= 1;

        let fileBuffer;

        console.log("FilePathhhhhhhhhhhhhhhhhhhhh",seller)

        if (isRemoteFile(movie.filePath)) {
            const response = await fetch(movie.filePath);
            if (!response.ok) {
                return res.status(404).json({ message: 'Movie file not found' });
            }
            fileBuffer = Buffer.from(await response.arrayBuffer());
        } else {
            const filePath = getLocalMoviePath(movie.filePath);
            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'Movie file not found' });
            }
            fileBuffer = fs.readFileSync(filePath);
        }

        const filename = path.basename(movie.filePath); 
        res.setHeader('Content-Disposition', `attachment; filename="${movie.title}"`);
        res.setHeader('Content-Type', 'video/mp4');

        res.end(fileBuffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const updateMovie = async (req, res) => {
    try {
        // console.log(req.body)
        // console.log("Hell")
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

      
        Object.assign(movie, req.body);

        const updatedMovie = await movie.save();
        res.status(200).json(updatedMovie);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getApprovedMoviesForSeller = async (req, res) => {
    const sellerId = req.params.sellerId;
    const popularMovies = await Movie.find({ isApproved: true, sellerId }).select('-movieCoverPhoto');
    res.status(200).json(popularMovies);
};

const getNonApprovedMoviesForSeller = async (req, res) => {
    const sellerId = req.params.sellerId;
    const popularMovies = await Movie.find({ isApproved: false, sellerId }).select('-movieCoverPhoto');
    res.status(200).json(popularMovies);
};


const deleteMovie = async (req, res) => {
    try {
        const movie = await Movie.findByIdAndDelete(req.params.id);
        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        // Delete the file from the folder
        if (isRemoteFile(movie.filePath) && CLOUDINARY_ENABLED) {
            try {
                const publicId = movie.filePath.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '');
                await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
            } catch (cloudinaryError) {
                console.warn('Cloudinary delete failed:', cloudinaryError.message);
            }
        } else {
            const filePath = getLocalMoviePath(movie.filePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Delete references from related models
        await deleteRelatedMovies(movie);

        res.status(200).json({ message: 'Movie deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const deleteRelatedMovies = async (movie) => {
    await User.updateMany({
        $pull: { userActivity: movie._id, moviesWishlist: movie._id }
    });

    await Person.updateMany({
        $pull: { filmography: movie._id }
    });

    const reviewsToDel = await Review.find({ movie: movie._id });

    for (const rev of reviewsToDel) {
        await Review.findByIdAndDelete(rev._id);
    }


    // console.log("movie deleted from references")
}

const getTrendingGenres = async (req, res) => {
    try {
        const genreTrends = await Movie.aggregate([
            { $unwind: "$genre" },
            { $group: { _id: "$genre", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        res.status(200).json(genreTrends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMovieByName = async (req, res) => {
    const trimmed = String(req.params.movieName || '').trim();
    if (!trimmed) {
        return res.status(200).json([]);
    }
    const titleRegex = new RegExp(`^${escapeRegex(trimmed)}$`, 'i');
    const movies = await Movie.find({ isApproved: true, title: titleRegex }).select('-movieCoverPhoto');
    res.status(200).json(movies);
};

const getActionMovies = async (req, res) => {
    const movies = await Movie.find({ isApproved: true, genre: 'Action' }).select('-movieCoverPhoto');
    res.status(200).json(movies);
};

const getComedyMovies = async (req, res) => {
    const movies = await Movie.find({ isApproved: true, genre: 'Comedy' }).select('-movieCoverPhoto');
    res.status(200).json(movies);
};


module.exports = {  
    uploadMovie,
    uploadMovieCoverPhoto,
    streamMovie,
    getMovies,
    getMoviesForAdmin,
    getMoviesByFilter,
    getTopMoviesByGenre,
    getTopMoviesOfTheMonth,
    getMostPopularMovies,
    getMovieById,
    updateMovie,
    deleteMovie,
    getTrendingGenres,
    uploadMovieMiddleware,
    uploadCoverPhotoMiddleware,
    getApprovedMoviesForSeller,
    getNonApprovedMoviesForSeller,
    getAllForSeller,
    getTopTenMovies,
    getMovieByName,
    getActionMovies,
    getComedyMovies,
    getMovieDetailsById
    
};