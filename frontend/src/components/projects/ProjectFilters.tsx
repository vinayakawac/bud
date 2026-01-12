'use client';

interface Filters {
  category: string;
  tech: string;
  year: string;
}

interface ProjectFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export function ProjectFilters({ filters, onFilterChange }: ProjectFiltersProps) {
  const categories = [
    'Web Application',
    'Mobile App',
    'AI/ML',
    'Data Visualization',
    'Productivity',
  ];

  const techs = [
    'React',
    'Next.js',
    'Node.js',
    'Python',
    'TypeScript',
    'PostgreSQL',
    'MongoDB',
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div className="mb-8 p-6 bg-card border border-border rounded-lg">
      <h2 className="text-lg font-bold mb-4 text-textPrimary">
        Filters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-textPrimary">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) =>
              onFilterChange({ ...filters, category: e.target.value })
            }
            className="w-full h-[42px] px-4 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-textPrimary">
            Technology
          </label>
          <select
            value={filters.tech}
            onChange={(e) => onFilterChange({ ...filters, tech: e.target.value })}
            className="w-full h-[42px] px-4 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Technologies</option>
            {techs.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-textPrimary">
            Year
          </label>
          <select
            value={filters.year}
            onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
            className="w-full h-[42px] px-4 bg-inputBg border border-inputBorder rounded-lg text-textPrimary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {(filters.category || filters.tech || filters.year) && (
        <button
          onClick={() => onFilterChange({ category: '', tech: '', year: '' })}
          className="mt-4 text-sm text-accent hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
