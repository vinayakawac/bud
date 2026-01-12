'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

export default function RateUsPage() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const mutation = useMutation({
    mutationFn: (data: { rating: number; feedback?: string }) =>
      api.createRating(data),
    onSuccess: () => {
      toast.success('Thank you for your feedback!');
      setRating(0);
      setFeedback('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit rating');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    mutation.mutate({
      rating,
      feedback: feedback.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-textPrimary">
            Rate Your Experience
          </h1>
          <p className="text-lg text-textSecondary">
            Your feedback helps us improve our platform
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-medium mb-4 text-textPrimary">
                How would you rate this platform?
              </label>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-5xl transition-all hover:scale-110 focus:outline-none focus:scale-110 inline-flex items-center justify-center w-14 h-14"
                    aria-label={`Rate ${star} stars`}
                  >
                    <span
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-500'
                          : 'text-border'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center mt-4 text-textSecondary">
                  You rated: {rating} star{rating > 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="feedback"
                className="block text-lg font-medium mb-2 text-textPrimary"
              >
                Additional Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={1000}
                rows={5}
                className="w-full px-4 py-3 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Tell us more about your experience..."
              />
              <p className="text-sm text-textSecondary mt-2">
                {feedback.length}/1000 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || rating === 0}
              className="w-full px-8 py-4 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Rating'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
