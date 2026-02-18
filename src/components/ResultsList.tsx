import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, FileText, ExternalLink, Quote, Table } from 'lucide-react';
import type { OpenAlexWork } from '../types/openalex';
import { exportToXML, downloadPdf, exportToCSV } from '../api/openalex';
import { WorkDetail } from './WorkDetail';

interface ResultsListProps {
  works: OpenAlexWork[];
  totalCount: number;
  onPageChange: (page: number) => void;
  currentPage: number;
  perPage: number;
}

export function ResultsList({ works, totalCount, onPageChange, currentPage, perPage }: ResultsListProps) {
  const [expandedWork, setExpandedWork] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / perPage);

  const handleDownloadXML = (work: OpenAlexWork) => {
    const xml = exportToXML(work);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `work-${work.id.split('/').pop()}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = (work: OpenAlexWork) => {
    if (work.open_access?.oa_url) {
      downloadPdf(work.open_access.oa_url, `work-${work.id.split('/').pop()}.pdf`);
    }
  };

  const handleGeneratePDF = (work: OpenAlexWork) => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const lines = doc.splitTextToSize(work.title, 180);
      doc.text(lines, 15, 20);
      
      doc.setFontSize(12);
      const authors = work.authorships?.map(a => a.author.display_name).join(', ') || 'Unknown';
      doc.text(`Authors: ${authors}`, 15, 40);
      doc.text(`Publication Date: ${work.publication_date}`, 15, 50);
      doc.text(`Type: ${work.type}`, 15, 60);
      doc.text(`Citations: ${work.cited_by_count}`, 15, 70);
      doc.text(`DOI: ${work.doi || 'N/A'}`, 15, 80);
      
      if (work.abstract) {
        doc.text('Abstract:', 15, 95);
        const abstractLines = doc.splitTextToSize(work.abstract, 180);
        doc.text(abstractLines, 15, 105);
      }
      
      doc.save(`work-${work.id.split('/').pop()}.pdf`);
    });
  };

  const handleDownloadAllCSV = () => {
    const csv = exportToCSV(works);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `openalex-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (works.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No results found</p>
        <p className="text-sm mt-2">Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, totalCount)} of {totalCount} results
        </span>
        {works.length > 0 && (
          <button
            onClick={handleDownloadAllCSV}
            className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
            title="Download all results as CSV"
          >
            <Table size={16} />
            Download All CSV
          </button>
        )}
      </div>

      <div className="space-y-4">
        {works.map((work) => (
          <div key={work.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => setExpandedWork(expandedWork === work.id ? null : work.id)}>
                  {work.display_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {work.authorships?.map(a => a.author.display_name).join(', ') || 'Unknown authors'}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{work.publication_date}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{work.type}</span>
                  <span className="flex items-center gap-1">
                    <Quote size={14} />
                    {work.cited_by_count} citations
                  </span>
                  {work.primary_location?.source && (
                    <span>{work.primary_location.source.display_name}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {work.open_access?.is_oa && work.open_access.oa_url && (
                  <button
                    onClick={() => handleDownloadPDF(work)}
                    className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    title="Download PDF"
                  >
                    <Download size={16} />
                    PDF
                  </button>
                )}
                <button
                  onClick={() => handleDownloadXML(work)}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  title="Download XML"
                >
                  <FileText size={16} />
                  XML
                </button>
                <button
                  onClick={() => handleGeneratePDF(work)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  title="Generate PDF from metadata"
                >
                  <ExternalLink size={16} />
                  Gen PDF
                </button>
              </div>
            </div>

            {expandedWork === work.id && (
              <WorkDetail work={work} onClose={() => setExpandedWork(null)} />
            )}

            <button
              onClick={() => setExpandedWork(expandedWork === work.id ? null : work.id)}
              className="mt-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              {expandedWork === work.id ? (
                <>
                  <ChevronUp size={16} /> Show less
                </>
              ) : (
                <>
                  <ChevronDown size={16} /> Show more
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
