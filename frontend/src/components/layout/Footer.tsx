export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-surface dark:bg-dark-surface light:bg-light-surface border-t border-dark-border dark:border-dark-border light:border-light-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-dark-text-secondary dark:text-dark-text-secondary light:text-light-text-secondary">
          <p>
            &copy; {currentYear} O-Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
