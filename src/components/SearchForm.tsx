import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, BookOpen, FileText, Filter } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { DocumentType, SearchFilters } from '../types/openalex';
import { searchTopics } from '../api/openalex';

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
  loading: boolean;
}

const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
  { value: 'article', label: 'Journal Article' },
  { value: 'preprint', label: 'Preprint' },
  { value: 'conference', label: 'Conference' },
  { value: 'proceedings', label: 'Proceedings' },
  { value: 'book', label: 'Book' },
  { value: 'other', label: 'Other' },
];

export function SearchForm({ onSearch, loading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [topicSuggestions, setTopicSuggestions] = useState<Array<{ id: string; display_name: string }>>([]);
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleTopicSearch = useCallback(async (input: string) => {
    if (input.length < 2) {
      setTopicSuggestions([]);
      return;
    }
    try {
      const suggestions = await searchTopics(input);
      setTopicSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to fetch topic suggestions:', error);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => handleTopicSearch(topicInput), 300);
    return () => clearTimeout(timeout);
  }, [topicInput, handleTopicSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      fromDate: fromDate?.toISOString().split('T')[0],
      toDate: toDate?.toISOString().split('T')[0],
      topics: selectedTopics,
      documentTypes: selectedTypes,
    });
  };

  const toggleDocumentType = (type: DocumentType) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const addTopic = (topicId: string) => {
    if (!selectedTopics.includes(topicId)) {
      setSelectedTopics([...selectedTopics, topicId]);
    }
    setTopicInput('');
    setTopicSuggestions([]);
  };

  const removeTopic = (topicId: string) => {
    setSelectedTopics(selectedTopics.filter(id => id !== topicId));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, authors, topics..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
      >
        <Filter size={18} />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Publication Date Range
              </label>
              <div className="flex items-center gap-2">
                <DatePicker
                  selected={fromDate}
                  onChange={setFromDate}
                  placeholderText="From date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  dateFormat="yyyy-MM-dd"
                />
                <span className="text-gray-500">to</span>
                <DatePicker
                  selected={toDate}
                  onChange={setToDate}
                  placeholderText="To date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  dateFormat="yyyy-MM-dd"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BookOpen size={16} className="inline mr-2" />
                Document Type
              </label>
              <div className="flex flex-wrap gap-2">
                {DOCUMENT_TYPES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleDocumentType(value)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedTypes.includes(value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText size={16} className="inline mr-2" />
              Topics
            </label>
            <div className="relative">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="Type to search topics..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {topicSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
                  {topicSuggestions.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => addTopic(topic.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      {topic.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedTopics.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedTopics.map((topicId) => (
                  <span
                    key={topicId}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {topicId}
                    <button
                      type="button"
                      onClick={() => removeTopic(topicId)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
