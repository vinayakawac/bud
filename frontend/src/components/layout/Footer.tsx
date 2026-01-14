import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 text-textSecondary">
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.ico"
              alt="O-Hub Logo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-semibold text-textPrimary">O-Hub</span>
          </div>
          <p>
            &copy; {currentYear} O-Hub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
