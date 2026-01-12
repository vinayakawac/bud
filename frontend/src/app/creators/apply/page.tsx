import Link from 'next/link';

export default function CreatorsApplyPage() {
  return (
    <div className="min-h-screen bg-bg px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-textPrimary mb-4">
            Become a Creator
          </h1>
          <p className="text-lg text-textSecondary mb-6">
            Join our community of talented creators and showcase your projects to
            the world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <svg className="w-12 h-12 text-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Showcase Your Work
            </h2>
            <p className="text-textSecondary">
              Create a portfolio of your best projects with detailed descriptions,
              images, and live demos.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <svg className="w-12 h-12 text-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Reach More People
            </h2>
            <p className="text-textSecondary">
              Get your projects discovered by visitors, potential clients, and
              fellow developers.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <svg className="w-12 h-12 text-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Get Feedback
            </h2>
            <p className="text-textSecondary">
              Receive ratings and feedback from the community to improve your
              work.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <svg className="w-12 h-12 text-accent mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Full Control
            </h2>
            <p className="text-textSecondary">
              Manage your projects with complete ownership. Edit, delete, or update
              anytime.
            </p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">
            Creator Guidelines
          </h2>
          <div className="space-y-4 text-textSecondary">
            <div>
              <h3 className="font-semibold text-textPrimary mb-2">
                ✓ What We Look For
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Original work or properly licensed content</li>
                <li>High-quality project descriptions and documentation</li>
                <li>Working demos and links (when applicable)</li>
                <li>Professional presentation with clear images</li>
                <li>Adherence to community standards</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-textPrimary mb-2">
                ✗ What's Not Allowed
              </h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Plagiarized or stolen content</li>
                <li>Spam or low-quality submissions</li>
                <li>Malicious code or security vulnerabilities</li>
                <li>Misleading information or fake demos</li>
                <li>Content that violates intellectual property rights</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-textPrimary mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-textSecondary mb-6">
            Create your creator account and start showcasing your projects today.
            You'll need to accept our terms and conditions before you can submit
            projects.
          </p>
          <div className="flex space-x-4">
            <Link
              href="/creator/register"
              className="bg-accent text-white px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Create Creator Account
            </Link>
            <Link
              href="/creator/login"
              className="border border-border text-textPrimary px-8 py-3 rounded-lg hover:bg-card transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
