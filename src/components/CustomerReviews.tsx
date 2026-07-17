import React, { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '@/utils/formatDate';

interface Review {
    _id: string;
    user: { _id: string; name: string; email: string };
    rating: number;
    comment: string;
    isPositive: boolean;
    tags: string[];
    createdAt: string;
}

interface Stats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

interface Props {
    productId: string;
}

const CustomerReviews = ({ productId }: Props) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<Stats>({
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    });
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [formRating, setFormRating] = useState(5);
    const [formComment, setFormComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);

    const [currentUser, setCurrentUser] = useState<any>(null);

    useEffect(() => {
        // Get user from local storage
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
            try {
                const { user } = JSON.parse(userInfoStr);
                setCurrentUser(user);
            } catch (e) {
                console.error('Error parsing user info', e);
            }
        }
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/products/${productId}/reviews`);
            setReviews(data.reviews);
            setStats(data.stats);

            // Check if current user has already reviewed
            const userInfoStr = localStorage.getItem('userInfo');
            if (userInfoStr) {
                const { user } = JSON.parse(userInfoStr);
                const existingReview = data.reviews.find((r: Review) => r.user?._id === user.id);
                if (existingReview) {
                    setHasReviewed(true);
                    setFormRating(existingReview.rating);
                    setFormComment(existingReview.comment);
                }
            }
        } catch (error) {
            console.error('Failed to fetch reviews', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentUser) {
            toast.error("Please login to submit a review");
            return;
        }

        try {
            setIsSubmitting(true);
            if (hasReviewed) {
                await api.put(`/products/${productId}/reviews`, {
                    rating: formRating,
                    comment: formComment,
                });
                toast.success('Review updated successfully!');
            } else {
                await api.post(`/products/${productId}/reviews`, {
                    rating: formRating,
                    comment: formComment,
                });
                toast.success('Review created successfully!');
                setHasReviewed(true);
            }
            setShowForm(false);
            fetchReviews();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculatePercentage = (count: number) => {
        if (stats.totalReviews === 0) return '0%';
        return `${Math.round((count / stats.totalReviews) * 100)}%`;
    };

    if (loading) {
        return (
            <div className="w-full mt-2 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="w-full mt-2">
            <h2 className="text-[18px] lg:text-[20px] font-bold text-gray-900 mb-4 lg:mb-6">Customer reviews</h2>
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left Column */}
                <div className="w-full lg:w-[35%] flex flex-col gap-4 sm:gap-6">
                    {/* 100% authentic badge */}
                    <div className="bg-[#eaf4eb] border border-[#d2e8d4] rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <span className="font-bold text-green-800 text-sm">100% authentic</span>
                        </div>
                        <p className="text-xs text-gray-700 mb-2">
                            Our products are sourced directly from brands or authorized distributors.
                        </p>
                    </div>

                    {/* Ratings */}
                    <div>
                        <div className="flex items-end gap-3 mb-1">
                            <span className="text-[25px] sm:text-[34px] md:text-[40px] leading-none font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
                            <div className="flex flex-col mb-1">
                                <div className="flex text-yellow-400 mb-1">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-4 h-4 ${i < Math.round(stats.averageRating) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                    ))}
                                </div>
                                <span className="text-[11px] text-gray-500">Based on {stats.totalReviews.toLocaleString()} ratings</span>
                            </div>
                        </div>

                        {/* Progress bars */}
                        <div className="space-y-3 mt-5">
                            {[5, 4, 3, 2, 1].map((stars) => {
                                const count = stats.ratingDistribution[stars as keyof typeof stats.ratingDistribution] || 0;
                                const pct = calculatePercentage(count);
                                return (
                                    <div key={stars} className="flex items-center gap-3 text-xs">
                                        <div className="flex text-yellow-400 w-[70px] justify-end">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3.5 h-3.5 ${i < stars ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                            ))}
                                        </div>
                                        <div className="flex-1 h-[6px] bg-gray-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#3d8c1c]" style={{ width: pct }}></div>
                                        </div>
                                        <div className="w-12 text-right text-gray-500">{count.toLocaleString()}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {!showForm ? (
                        <button
                            onClick={() => {
                                if (!currentUser) {
                                    toast.error("Please login to write a review");
                                    return;
                                }
                                setShowForm(true);
                            }}
                            className="w-full bg-[#3d8c1c] hover:bg-green-700 text-white font-bold py-2.5 cursor-pointer rounded-md transition-colors mt-2 text-sm"
                        >
                            {hasReviewed ? 'Edit Your Review' : 'Write a Review'}
                        </button>
                    ) : (
                        <form onSubmit={handleSubmit} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                            <h3 className="font-bold mb-3">{hasReviewed ? 'Edit your review' : 'Write a review'}</h3>
                            <div className="mb-4">
                                <label className="block text-xs text-gray-700 mb-1">Rating</label>
                                <div className="flex text-yellow-400 gap-1 cursor-pointer">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <svg
                                            key={star}
                                            onClick={() => setFormRating(star)}
                                            className={`w-5 sm:w-6 h-5 sm:h-6 ${star <= formRating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-xs text-gray-700 mb-1">Comment</label>
                                <textarea
                                    required
                                    value={formComment}
                                    onChange={(e) => setFormComment(e.target.value)}
                                    className="w-full border border-gray-300 rounded p-2 text-sm h-24 focus:outline-none focus:border-1 focus:border-black"
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 bg-[#3d8c1c] hover:bg-green-700 text-white cursor-pointer font-bold py-2 rounded text-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 border border-gray-300 bg-white cursor-pointer hover:bg-gray-50 text-gray-700 font-bold py-2 rounded text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Right Column */}
                <div className="w-full lg:w-[65%] flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">All reviews</h3>
                    {reviews.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                            No reviews yet. Be the first to review!
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {reviews.map((review) => (
                                <div key={review._id} className="border-b border-gray-200 pb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                                            {review.user?.name ? review.user.name[0].toUpperCase() : 'U'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-[13px] sm:text-sm text-gray-900">{review.user?.name || review.user?.email || 'User'}</div>
                                            <div className="text-[11px] sm:text-xs text-gray-500">
                                                {formatDate(review.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex text-yellow-400 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerReviews;
