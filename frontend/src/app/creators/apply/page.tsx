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
            <div className="text-3xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Showcase Your Work
            </h2>
            <p className="text-textSecondary">
              Create a portfolio of your best projects with detailed descriptions,
              images, and live demos.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-4">🚀</div>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Reach More People
            </h2>
            <p className="text-textSecondary">
              Get your projects discovered by visitors, potential clients, and
              fellow developers.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-4">⭐</div>
            <h2 className="text-xl font-semibold text-textPrimary mb-2">
              Get Feedback
            </h2>
            <p className="text-textSecondary">
              Receive ratings and feedback from the community to improve your
              work.
            </p>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="text-3xl mb-4">🔒</div>
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
