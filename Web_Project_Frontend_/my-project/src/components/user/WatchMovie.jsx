import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import { getMovieById, getMovieDetailsById } from '../../services/movies/MoviesManagement';
import { getUserRole, getIsSubscribed, getLoggedInId } from '../../services/GetCookieValues';
import { addMovieToWishlist, createMovieReview, getMovieReviews, getReviewBarGraph, getReviewPieGraph } from '../../services/user/UserEngagement';

function WatchMovie() {
    const location = useLocation();
    const id = location.state?.id;

    const [videoUrl, setVideoUrl] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [movieDetails, setMovieDetails] = useState(null);
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [pieGraphUrl, setPieGraphUrl] = useState('');
    const [barGraphUrl, setBarGraphUrl] = useState('');

    const canWatch =
        (getUserRole() === 'user' && getIsSubscribed()) ||
        getUserRole() === 'seller' ||
        getUserRole() === 'admin';

    useEffect(() => {
        const fetchMovie = async () => {
            if (!id) {
                console.error("No movie ID found in location state.");
                return;
            }
            try {
                const movieData = await getMovieById(id);
                setVideoUrl(movieData.videoURL);
                const details = await getMovieDetailsById(id);
                setMovieDetails(details);
                const reviewList = await getMovieReviews(id);
                setReviews(reviewList);
                const pie = await getReviewPieGraph(id);
                const bar = await getReviewBarGraph(id);
                setPieGraphUrl(pie);
                setBarGraphUrl(bar);
            } catch (error) {
                console.error("Error fetching movie:", error);
            }
        };

        fetchMovie();
    }, [id]);

    if (!id) {
        return (
            <div className="mh-container py-12">
                <p className="mh-card px-6 py-8 text-center text-slate-300">
                    No movie selected. Open a title from the dashboard or search.
                </p>
            </div>
        );
    }

    const addWishlist = async () => {
        await addMovieToWishlist(id);
        setMessage('Added to watchlist.');
    };

    const submitReview = async (e) => {
        e.preventDefault();
        await createMovieReview({
            userId: getLoggedInId(),
            movieId: id,
            rating,
            content,
        });
        setContent('');
        setMessage('Review submitted.');
        const reviewList = await getMovieReviews(id);
        setReviews(reviewList);
        const pie = await getReviewPieGraph(id);
        const bar = await getReviewBarGraph(id);
        setPieGraphUrl(pie);
        setBarGraphUrl(bar);
    };

    return (
        <div className="min-h-screen text-white pb-16">
            <div className="mh-container py-6 md:py-10 space-y-8">
                {canWatch ? (
                    videoUrl ? (
                        <>
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/60 bg-black ring-1 ring-cyan-500/10">
                                <video controls playsInline className="w-full max-h-[min(78vh,920px)] mx-auto block">
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button type="button" onClick={addWishlist} className="mh-btn-accent px-5 py-2.5 rounded-xl">
                                    + Add to watchlist
                                </button>
                                {message && (
                                    <span className="text-sm text-cyan-300/90 bg-cyan-500/10 border border-cyan-400/20 px-3 py-1.5 rounded-lg">
                                        {message}
                                    </span>
                                )}
                            </div>

                            <div className="mh-card p-6 md:p-8 space-y-5">
                                {movieDetails && (
                                    <div className="mb-4 text-sm text-slate-300 space-y-1">
                                        <p><strong>Title:</strong> {movieDetails.title}</p>
                                        <p><strong>Overview:</strong> {movieDetails.overview || 'N/A'}</p>
                                        <p><strong>Director:</strong> {movieDetails.director?.name || 'N/A'}</p>
                                        <p><strong>Cast:</strong> {Array.isArray(movieDetails.cast) && movieDetails.cast.length ? movieDetails.cast.map((c) => c.name).join(', ') : 'N/A'}</p>
                                    </div>
                                )}
                                <h2 className="font-display text-xl md:text-2xl font-bold text-white">Write a review</h2>
                                <form onSubmit={submitReview} className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <label className="text-sm text-slate-400">Rating</label>
                                        <select
                                            value={rating}
                                            onChange={(e) => setRating(Number(e.target.value))}
                                            className="mh-input py-2 max-w-[120px]"
                                        >
                                            {[1, 2, 3, 4, 5].map((r) => (
                                                <option key={r} value={r}>{r} — stars</option>
                                            ))}
                                        </select>
                                    </div>
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        placeholder="Share your thoughts..."
                                        className="mh-input min-h-[100px] resize-y"
                                        rows={3}
                                        required
                                    />
                                    <button type="submit" className="mh-btn-primary px-6 py-2.5 rounded-xl">
                                        Submit review
                                    </button>
                                </form>
                            </div>

                            <div className="mh-card p-6 md:p-8">
                                <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-5">Reviews</h2>
                                {reviews.length === 0 ? (
                                    <p className="text-slate-400">No reviews yet — be the first.</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {reviews.map((review) => (
                                            <li
                                                key={review._id}
                                                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                                            >
                                                <p className="text-xs uppercase tracking-wider text-cyan-400/90 mb-1">
                                                    {review.rating}/5
                                                </p>
                                                <p className="text-slate-200 leading-relaxed">{review.content}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="mh-card p-6 md:p-8">
                                <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-5">Rating analytics</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Pie chart</p>
                                        {pieGraphUrl ? <img src={pieGraphUrl} alt="Review pie chart" className="rounded-lg border border-white/10" /> : <p className="text-slate-500">No pie graph.</p>}
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-400 mb-2">Bar chart</p>
                                        {barGraphUrl ? <img src={barGraphUrl} alt="Review bar chart" className="rounded-lg border border-white/10" /> : <p className="text-slate-500">No bar graph.</p>}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-slate-400 animate-pulse">Loading video…</p>
                        </div>
                    )
                ) : (
                    <div className="mh-card px-8 py-12 text-center max-w-lg mx-auto">
                        <p className="font-display text-lg font-semibold text-white mb-2">Subscription required</p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Subscribe to stream this title. Visit Subscription in the menu to continue.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WatchMovie;
