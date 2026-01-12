'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatorTermsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if already accepted
    const checkTermsStatus = async () => {
      try {
        const response = await fetch('/api/creator/me');
        if (response.ok) {
          const data = await response.json();
          if (data.data.creator.termsAccepted) {
            router.push('/creator/dashboard');
          }
        }
      } catch (err) {
        console.error('Failed to check terms status:', err);
      }
    };

    checkTermsStatus();
  }, [router]);

  const handleAccept = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/creator/accept-terms', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept terms');
      }

      router.push('/creator/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold text-textPrimary mb-4">
            Creator Terms & Conditions
          </h1>
          <p className="text-textSecondary mb-6">
            Please read and accept our terms to continue
          </p>

          <div className="prose prose-invert max-w-none mb-8 text-textSecondary space-y-4">
            <h2 className="text-xl font-semibold text-textPrimary">
              1. Account Responsibilities
            </h2>
            <p>
              As a creator, you are responsible for maintaining the security of
              your account and for all activities that occur under your account.
              You must immediately notify us of any unauthorized uses of your
              account.
            </p>

            <h2 className="text-xl font-semibold text-textPrimary">
              2. Content Guidelines
            </h2>
            <p>
              All projects you submit must be your own work or properly licensed.
              You may not submit content that infringes on intellectual property
              rights, contains malicious code, or violates applicable laws.
            </p>

            <h2 className="text-xl font-semibold text-textPrimary">
              3. Project Ownership
            </h2>
            <p>
              You retain full ownership of your projects. By uploading projects,
              you grant us a non-exclusive license to display and promote your
              work on our platform.
            </p>

            <h2 className="text-xl font-semibold text-textPrimary">
              4. Quality Standards
            </h2>
            <p>
              We expect all creators to maintain high-quality standards. Projects
              should include accurate descriptions, working links, and appropriate
              images. Spam or low-quality submissions may result in account
              suspension.
            </p>

            <h2 className="text-xl font-semibold text-textPrimary">
              5. Account Suspension
            </h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate
              these terms, engage in fraudulent activities, or harm the community.
            </p>

            <h2 className="text-xl font-semibold text-textPrimary">
              6. Changes to Terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              platform after changes constitutes acceptance of the new terms.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex items-start space-x-3 mb-6">
            <input
              id="accept-terms"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="accept-terms" className="text-textPrimary">
              I have read and agree to the Creator Terms & Conditions
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="flex-1 bg-accent text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Accepting...' : 'Accept & Continue'}
            </button>
            <button
              onClick={() => router.push('/creator/login')}
              className="px-6 py-3 border border-border text-textPrimary rounded-lg hover:bg-card transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
