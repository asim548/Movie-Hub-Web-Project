require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const cors = require('cors');

const { loginUserSellerAdmin, authenticateToken, googleAuth, authorizeRoles } = require('./utility/util'); 
const { uploadMovieMiddleware,
    uploadCoverPhotoMiddleware, uploadMovie,uploadMovieCoverPhoto, streamMovie, getMovies, getMoviesByFilter, getTopMoviesByGenre, getTopMoviesOfTheMonth, getMostPopularMovies, getMovieById, updateMovie, deleteMovie, getTrendingGenres, getApprovedMoviesForSeller, getNonApprovedMoviesForSeller, 
    getAllForSeller,
    getMoviesForAdmin,
    getTopTenMovies,
    getMovieByName,
    getActionMovies,
    getComedyMovies,
    getMovieDetailsById} = require('./modules/movies/MoviesController');
const { registerAdminSeller,updateProfileAdminSeller, getProfileAdminSeller, getAllAdminSellers, getAllAdmins, getAllSellers, deleteAdminSeller, adminDashboard, sellerDashboard}=require('./modules/adminSellerUser/AdminSellerController');
const {registerUser, getProfile,getAllUsers,updateProfile,deleteUser,getUserWishlist,getMoviesBasedOnUserActivities, getSubscriptionForUser}=require('./modules/adminSellerUser/UserController');
const {createPerson,getPersons,getPersonById,updatePerson,deletePerson}=require('./modules/persons/PersonController');
const {getReviewPieGraph,getReviewBarGraph,createReview, updateReview, getAllReviewsForMovie,getTopRatedReviewsForMovie,getMostDiscussedReviewsForMovie,deleteReviewByAdmin}=require('./modules/reviews/ReviewController')
const { getMoviesBasedOnGenreUserRatingAndUserActivity, getSimilarTitlesMovies, getTrendingMovies, getTopRatedMovies } = require('./modules/recomendation/RecomendationController');
const {getAllWatchHistory,addToWatchHistory,deleteFromWatchHistory} = require('./modules/watchHistory/WatchHistoryController');
const{ payment,addOrUpdateSubscriptionForUser,getAllSubscriptionsForUser}=require('./modules/subscriptionManagement/CustomerSubscriptionController');
const{ addSubscriptionPlan, getAllSubscriptionPlans,updateSubscriptionPlan,deleteSubscriptionPlan}=require('./modules/subscriptionManagement/SubscriptionPlanController');
const { addNotification, deleteNotification, getNotification, getAllNotifications, getNotificationRecipients } = require('./modules/notification/NotificationController');
const { addSellerCardDetails, getSellerCardDetails } = require('./modules/adminSellerUser/SellerCardController');
const app = express();



app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const SERVER_ID = 'WebMovie-backend';

const sendHealth = (req, res) => {
    res.json({
        ok: true,
        serverId: SERVER_ID,
        mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
    });
};

app.get('/health', sendHealth);
app.get('/api/health', sendHealth);

app.get('/', (req, res) => {
    res.type('html').send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Movie API</title></head><body style="font-family:system-ui;padding:2rem;">
    <h1>Backend API is running</h1>
    <p>This URL (<code>http://localhost:3213</code>) is the <strong>REST API</strong>, not the website. Open the React app instead (usually <a href="http://localhost:5173">http://localhost:5173</a> or <a href="http://localhost:5174">http://localhost:5174</a>).</p>
    <p>Try: <code>POST /login/userSellerAdmin</code> with JSON <code>{ "email", "password" }</code>, then <code>GET /movies</code> with header <code>Authorization: Bearer &lt;token&gt;</code>.</p>
    </body></html>`);
});

////////////////////////////////////////////only isApproved wali movies
//Routes where authentication is not needed
app.post('/adminseller/register', registerAdminSeller);
app.post('/user/register', registerUser);
app.post('/login/userSellerAdmin', loginUserSellerAdmin);
app.post('/auth/google', googleAuth);

//AdminSeller
app.get('/adminDashboard', authenticateToken, authorizeRoles('admin'), adminDashboard);
app.get('/sellerDashboard/:id', authenticateToken, authorizeRoles('seller', 'admin'), sellerDashboard);
app.put('/adminseller/update', authenticateToken, authorizeRoles('admin', 'seller'), updateProfileAdminSeller);
app.get('/adminseller/profile', authenticateToken, getProfileAdminSeller);
app.get('/adminseller/all', authenticateToken, authorizeRoles('admin'), getAllAdminSellers);
app.get('/adminseller/admins', authenticateToken, authorizeRoles('admin'), getAllAdmins);
app.get('/adminseller/sellers', authenticateToken, authorizeRoles('admin'), getAllSellers);
app.delete('/adminseller/delete/:id', authenticateToken, authorizeRoles('admin'), deleteAdminSeller);
app.post('/seller/card-details', authenticateToken, authorizeRoles('seller', 'admin'), addSellerCardDetails);
app.get('/seller/card-details/:sellerId', authenticateToken, authorizeRoles('seller', 'admin'), getSellerCardDetails);

//User
app.get('/user/profile', authenticateToken, getProfile);
app.get('/user/all', authenticateToken, authorizeRoles('admin'), getAllUsers);   
app.put('/user/update', authenticateToken, updateProfile);
app.delete('/user/delete/:userId', authenticateToken, authorizeRoles('admin'), deleteUser);
app.get('/user/wishlist/:userId', authenticateToken, getUserWishlist);
app.get('/user/activities/:userId', authenticateToken, getMoviesBasedOnUserActivities);
app.get('/getSubscriptionForUser/:userId', authenticateToken, getSubscriptionForUser);

//Person
app.post('/persons', authenticateToken, authorizeRoles('seller', 'admin'), createPerson); // Create a new person
app.get('/persons', authenticateToken, authorizeRoles('seller', 'admin'), getPersons); // Get all persons with pagination
app.get('/persons/:id', authenticateToken, authorizeRoles('seller', 'admin'), getPersonById); // Get a specific person by ID
app.put('/persons/:id', authenticateToken, authorizeRoles('seller', 'admin'), updatePerson); // Update a specific person by ID
app.delete('/persons/:id', authenticateToken, authorizeRoles('seller', 'admin'), deletePerson);

// Movie — list specific /movies/... routes before /movies/:id so :id never captures "filter", "popular", etc.
app.get('/movie/getByName/:movieName', authenticateToken, getMovieByName);
app.get('/movies/getAll', authenticateToken, authorizeRoles('admin'), getMoviesForAdmin);
app.get('/movies/getAllAction', authenticateToken, getActionMovies);
app.get('/movies/getAllComedy', authenticateToken, getComedyMovies);
app.get('/movies/details/:id', authenticateToken, getMovieDetailsById);
app.get('/movies', authenticateToken, getTopTenMovies);
app.get('/movies/filter', authenticateToken, getMoviesByFilter);
app.post('/movies/filter', authenticateToken, getMoviesByFilter);
app.get('/movies/top/genre', authenticateToken, getTopMoviesByGenre);
app.get('/movies/top/month', authenticateToken, getTopMoviesOfTheMonth);
app.get('/movies/popular', authenticateToken, getMostPopularMovies);
app.get('/movies/trending/genres', authenticateToken, getTrendingGenres);
app.get('/movies/getAllForSeller/:id', authenticateToken, getAllForSeller);
app.get('/movies/getApprovedMoviesForSeller/:sellerId', authenticateToken, getApprovedMoviesForSeller);
app.get('/movies/getNonApprovedMoviesForSeller/:sellerId', authenticateToken, getNonApprovedMoviesForSeller);
app.post('/movies/upload', authenticateToken, authorizeRoles('seller', 'admin'), uploadMovieMiddleware, uploadMovie);
app.post('/movies/:id/upload-cover', authenticateToken, authorizeRoles('seller', 'admin'), uploadCoverPhotoMiddleware, uploadMovieCoverPhoto);
app.put('/movies/:id', authenticateToken, authorizeRoles('seller', 'admin'), updateMovie);
app.delete('/movies/:id', authenticateToken, authorizeRoles('seller', 'admin'), deleteMovie);
app.get('/movies/:id', authenticateToken, getMovieById);

//Review Routes   
app.post('/reviews', authenticateToken, createReview); // Create a review
app.put('/reviews/:reviewId', authenticateToken, updateReview); // Update a review
app.get('/reviews/movie/:movie', authenticateToken, getAllReviewsForMovie); // Get all reviews for a specific movie
app.get('/reviews/top/movie/:movie', authenticateToken, getTopRatedReviewsForMovie); // Get top-rated reviews for a movie
app.get('/reviews/most-discussed', authenticateToken, getMostDiscussedReviewsForMovie); // Get the most discussed movie reviews
app.get('/reviews/pie-graph/:movieId', authenticateToken, getReviewPieGraph); // Get pie chart of reviews for a movie
app.get('/reviews/bar-graph/:movieId', authenticateToken, getReviewBarGraph); // Get bar chart of reviews for a movie
app.delete('/reviews/:reviewId', authenticateToken, authorizeRoles('admin'), deleteReviewByAdmin); // Delete a review by admin

//Recomendation
app.get('/movies/genre-user-rating-activity/:userId',authenticateToken, getMoviesBasedOnGenreUserRatingAndUserActivity);// Route to get movies similar to a given movie (by genre, director, etc.)
app.get('/movies/similar/:movieId',authenticateToken,getSimilarTitlesMovies);// Route to get trending movies based on user ratings
app.get('/movies/trending/:userId',authenticateToken, getTrendingMovies);// Route to get top-rated movies based on user ratings and popularity
app.post('/movies/top-rated',authenticateToken, getTopRatedMovies);

//WatchHistory
app.get('/watch-history/:userId',authenticateToken, getAllWatchHistory);// Add a movie to watch history
app.post('/watch-history', authenticateToken,addToWatchHistory);// Delete a movie from watch history
app.delete('/watch-history/:userId/:movieId', authenticateToken,deleteFromWatchHistory);

// Customer Subscription Routes
app.post('/subscriptions/process-payment',authenticateToken, payment);
app.get('/subscriptions/:userId',authenticateToken, getAllSubscriptionsForUser);

// Subscription Plan Routes
app.post('/plans',authenticateToken, authorizeRoles('admin'), addSubscriptionPlan);
app.get('/plans',authenticateToken, getAllSubscriptionPlans);
app.put('/plans/:id',authenticateToken, authorizeRoles('admin'), updateSubscriptionPlan);
app.delete('/plans/:id',authenticateToken, authorizeRoles('admin'), deleteSubscriptionPlan);

//Notification
app.get('/notifications/recipients/all', authenticateToken, getNotificationRecipients);
app.get('/notifications/:userId',authenticateToken, getAllNotifications);// Get a Specific Notification for a User
app.get('/notifications/:userId/:notificationId', authenticateToken,getNotification);// Add a Notification (can be used for manual testing)
app.post('/notifications/add',authenticateToken, addNotification);// Delete a Notification
app.delete('/notifications/:id',authenticateToken, deleteNotification);



const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    console.error('Set MONGODB_URI in Web_Project_Backend/.env (see .env.example).');
    process.exit(1);
}
mongoose.connect(mongoUri, {})
    .then(() => console.log("Connection built"))
    .catch((e) => console.log("Connection failed", e.message));

const PORT = Number(process.env.PORT) || 3213;
app.listen(PORT, () => {
    console.log(`[${SERVER_ID}] Server is running on port ${PORT}`);
    console.log(`[${SERVER_ID}] Health: /health  or  /api/health`);
});
