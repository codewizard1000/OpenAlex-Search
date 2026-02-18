export interface OpenAlexAuthor {
  id: string;
  display_name: string;
  orcid?: string;
}

export interface OpenAlexWork {
  id: string;
  display_name: string;
  title: string;
  publication_date: string;
  type: string;
  type_crossref?: string;
  cited_by_count: number;
  relevance_score?: number;
  abstract?: string;
  doi?: string;
  open_access?: {
    is_oa: boolean;
    oa_status: string;
    oa_url?: string;
  };
  primary_location?: {
    source?: {
      display_name: string;
    };
    pdf_url?: string;
    landing_page_url?: string;
  };
  authorships?: Array<{
    author: OpenAlexAuthor;
    institutions?: Array<{ display_name: string }>;
  }>;
  concepts?: Array<{
    id: string;
    display_name: string;
    score: number;
  }>;
}

export interface OpenAlexSearchResponse {
  meta: {
    count: number;
    db_response_time_ms: number;
    page: number;
    per_page: number;
  };
  results: OpenAlexWork[];
}

export type DocumentType = 'article' | 'preprint' | 'conference' | 'proceedings' | 'book' | 'other';

export interface SearchFilters {
  query: string;
  fromDate?: string;
  toDate?: string;
  topics: string[];
  documentTypes: DocumentType[];
}
