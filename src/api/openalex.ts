import type { OpenAlexSearchResponse, OpenAlexWork } from '../types/openalex';

const API_BASE_URL = 'https://api.openalex.org';

function buildUrl(endpoint: string, params: Record<string, string | number | undefined>): string {
  const url = new URL(API_BASE_URL + endpoint);
  
  // Add mailto for polite pool (better rate limits)
  url.searchParams.append('mailto', 'ed@openclaw.ai');
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  
  return url.toString();
}

export interface SearchParams {
  query?: string;
  fromDate?: string;
  toDate?: string;
  topics?: string[];
  documentTypes?: string[];
  page?: number;
  perPage?: number;
}

export async function searchWorks(params: SearchParams): Promise<OpenAlexSearchResponse> {
  const filters: string[] = [];

  if (params.fromDate || params.toDate) {
    const from = params.fromDate || '*';
    const to = params.toDate || '*';
    filters.push(`from_publication_date:${from},to_publication_date:${to}`);
  }

  if (params.documentTypes && params.documentTypes.length > 0) {
    const typeFilter = params.documentTypes.join('|');
    filters.push(`type:${typeFilter}`);
  }

  if (params.topics && params.topics.length > 0) {
    const topicFilter = params.topics.join('|');
    filters.push(`concepts.id:${topicFilter}`);
  }

  const queryParams: Record<string, string | number> = {
    page: params.page || 1,
    per_page: params.perPage || 25,
    sort: 'relevance_score:desc',
  };

  if (params.query && params.query.trim()) {
    queryParams.search = params.query.trim();
  }

  if (filters.length > 0) {
    queryParams.filter = filters.join(',');
  }

  const url = buildUrl('/works', queryParams);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'OpenAlexSearch/1.0 (mailto:ed@openclaw.ai)',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function getWork(id: string): Promise<OpenAlexWork> {
  const url = buildUrl(`/works/${id}`, {});
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'OpenAlexSearch/1.0 (mailto:ed@openclaw.ai)',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export async function searchTopics(query: string): Promise<Array<{ id: string; display_name: string }>> {
  const url = buildUrl('/concepts', {
    search: query,
    per_page: 10,
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'OpenAlexSearch/1.0 (mailto:ed@openclaw.ai)',
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.results.map((concept: { id: string; display_name: string }) => ({
    id: concept.id,
    display_name: concept.display_name,
  }));
}

export function downloadPdf(url: string, filename: string) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToXML(work: OpenAlexWork): string {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<work>
  <id>${work.id}</id>
  <title>${escapeXml(work.title)}</title>
  <publication_date>${work.publication_date}</publication_date>
  <type>${work.type}</type>
  <doi>${work.doi || ''}</doi>
  <cited_by_count>${work.cited_by_count}</cited_by_count>
  <abstract>${escapeXml(work.abstract || '')}</abstract>
  <authors>
    ${work.authorships?.map(a => `<author>${escapeXml(a.author.display_name)}</author>`).join('\n    ') || ''}
  </authors>
  <venue>${escapeXml(work.primary_location?.source?.display_name || '')}</venue>
</work>`;
  return xml;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function exportToCSV(works: OpenAlexWork[]): string {
  const headers = [
    'Title',
    'Authors',
    'Author Institutions',
    'Article Type',
    'Publication Date',
    'Venue',
    'DOI',
    'OpenAlex ID',
    'Cited By Count',
    'Open Access',
    'OA Status',
    'Abstract'
  ];

  const rows = works.map(work => {
    const authors = work.authorships?.map(a => a.author.display_name).join('; ') || '';
    
    const institutions = work.authorships?.flatMap(a => 
      a.institutions?.map(i => i.display_name) || []
    ).filter((v, i, a) => a.indexOf(v) === i).join('; ') || '';

    return [
      escapeCsv(work.title),
      escapeCsv(authors),
      escapeCsv(institutions),
      escapeCsv(work.type),
      escapeCsv(work.publication_date),
      escapeCsv(work.primary_location?.source?.display_name || ''),
      escapeCsv(work.doi || ''),
      escapeCsv(work.id),
      work.cited_by_count.toString(),
      work.open_access?.is_oa ? 'Yes' : 'No',
      escapeCsv(work.open_access?.oa_status || ''),
      escapeCsv(work.abstract || '')
    ];
  });

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

function escapeCsv(value: string): string {
  if (!value) return '';
  const escaped = value.replace(/"/g, '""');
  if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  return escaped;
}
