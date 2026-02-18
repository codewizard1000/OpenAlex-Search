import { useState } from 'react';
import { BookOpen, Github } from 'lucide-react';
import { SearchForm } from './components/SearchForm';
import { ResultsList } from './components/ResultsList';
import type { SearchFilters, OpenAlexWork } from './types/openalex';
import { searchWorks } from './api/openalex';

function App() {
  const [works, setWorks] = useState<OpenAlexWork[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);
  const perPage = 25;

  const handleSearch = async (filters: SearchFilters, page: number = 1) => {
    setLoading(true);
    setError(null);
    setLastFilters(filters);

    try {
      const response = await searchWorks({
        query: filters.query,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        topics: filters.topics,
        documentTypes: filters.documentTypes,
        page,
        perPage,
      });
      
      setWorks(response.results);
      setTotalCount(response.meta.count);
      setCurrentPage(page);
    } catch (err: any) {
      console.error('Search failed:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch results';
      setError(`Error: ${errorMessage}. Please try again.`);
      setWorks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (lastFilters) {
      handleSearch(lastFilters, page);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="text-blue-600" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OpenAlex Search</h1>
                <p className="text-sm text-gray-600">Search millions of academic papers</p>
              </div>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Github size={24} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchForm onSearch={(filters) => handleSearch(filters, 1)} loading={loading} />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <ResultsList
          works={works}
          totalCount={totalCount}
          currentPage={currentPage}
          perPage={perPage}
          onPageChange={handlePageChange}
        />
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-600">
            Powered by <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAlex</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
