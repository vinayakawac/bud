'use client';

interface Filters {
  category: string;
  tech: string;
  year: string;
  sort: string;
}

interface ProjectFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  categories: string[];
  technologies: string[];
}

export function ProjectFilters({ 
  filters, 
  onFilterChange,
  categories = [],
}: ProjectFiltersProps) {
  const handleClearFilters = () => {
    onFilterChange({ category: '', tech: '', year: '', sort: 'latest' });
  };

  const hasActiveFilters = filters.category || filters.tech || filters.year;

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-textPrimary">Filters</h2>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-accent hover:text-accent/80 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-textPrimary">Sort by</h3>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
            className="w-full px-3 py-2 bg-bgSecondary border border-border rounded text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="latest">Latest</option>
            <option value="rating">Highest Rated</option>
            <option value="views">Most Popular</option>
            <option value="comments">Most Discussed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-textPrimary">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === category}
                  onChange={() =>
                    onFilterChange({
                      ...filters,
                      category: filters.category === category ? '' : category,
                    })
                  }
                  className="w-4 h-4 text-accent border-border focus:ring-accent focus:ring-offset-0"
                />
                <span className="text-sm text-textSecondary group-hover:text-textPrimary transition-colors">
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Year Filter */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-3 text-textPrimary">Year</h3>
          <select
            value={filters.year}
            onChange={(e) =>
              onFilterChange({ ...filters, year: e.target.value })
            }
            className="w-full px-3 py-2 bg-bgSecondary border border-border rounded text-sm text-textPrimary focus:outline-none focus:border-accent transition-colors"
          >
            <option value="">All time</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
