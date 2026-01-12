import Link from 'next/link';
import { FeaturedProjects } from '@/components/home/FeaturedProjects';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-dark-bg dark:bg-dark-bg light:bg-light-bg border-b border-dark-border dark:border-dark-border light:border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
              Explore Cutting-Edge Projects
            </h1>
            <p className="text-xl md:text-2xl text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary mb-8">
              A collection of innovative projects and solutions. Get in touch to have your own custom project built for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="px-8 py-3 bg-dark-accent dark:bg-dark-accent light:bg-light-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Browse Projects
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 border border-dark-border dark:border-dark-border light:border-light-border text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary rounded-lg font-medium hover:bg-dark-surface dark:hover:bg-dark-surface light:hover:bg-light-surface transition-colors"
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
              Featured Projects
            </h2>
            <p className="text-lg text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
              Discover our latest and most innovative projects
            </p>
          </div>
          <FeaturedProjects />
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 bg-dark-surface dark:bg-dark-surface light:bg-light-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-dark-text-primary dark:text-dark-text-primary light:text-light-text-primary">
              About This Platform
            </h2>
            <div className="space-y-4 text-lg text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
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
