import Link from 'next/link';
import { FeaturedProjects } from '@/components/home/FeaturedProjects';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-textPrimary">
              Explore Cutting-Edge Projects
            </h1>
            <p className="text-xl md:text-2xl text-textSecondary mb-8">
              A collection of innovative projects and solutions. Get in touch to have your own custom project built for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="px-8 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Browse Projects
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 border border-border text-textPrimary rounded-lg font-medium hover:bg-cardHover transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-textPrimary">
              Featured Projects
            </h2>
            <p className="text-lg text-textSecondary">
              Discover our latest and most innovative projects
            </p>
          </div>
          <FeaturedProjects />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-textPrimary">
              About This Platform
            </h2>
            <div className="space-y-4 text-lg text-textSecondary">
              <p>
                This platform serves as a comprehensive showcase for production-grade projects spanning various technologies and domains. Each project is carefully selected to demonstrate real-world applications, best practices, and innovative solutions.
              </p>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p>
                Whether you&apos;re looking for inspiration, seeking to understand modern development patterns, or interested in exploring diverse tech stacks, you&apos;ll find valuable insights here.
              </p>
              <p>
                All projects are available for exploration with detailed documentation, technical specifications, and downloadable resources.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
