import { X } from 'lucide-react';
import type { OpenAlexWork } from '../types/openalex';

interface WorkDetailProps {
  work: OpenAlexWork;
  onClose: () => void;
}

export function WorkDetail({ work, onClose }: WorkDetailProps) {
  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold text-gray-800">Work Details</h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      
      {work.abstract && (
        <div className="mb-4">
          <h5 className="font-medium text-gray-700 mb-2">Abstract</h5>
          <p className="text-gray-600 text-sm leading-relaxed">{work.abstract}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">OpenAlex ID:</span>
          <a 
            href={work.id} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 hover:underline"
          >
            {work.id.split('/').pop()}
          </a>
        </div>
        
        {work.doi && (
          <div>
            <span className="font-medium text-gray-700">DOI:</span>
            <a 
              href={`https://doi.org/${work.doi}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 hover:underline"
            >
              {work.doi}
            </a>
          </div>
        )}

        <div>
          <span className="font-medium text-gray-700">Open Access:</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${work.open_access?.is_oa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {work.open_access?.is_oa ? 'Yes' : 'No'}
          </span>
        </div>

        {work.open_access?.oa_status && (
          <div>
            <span className="font-medium text-gray-700">OA Status:</span>
            <span className="ml-2 text-gray-600">{work.open_access.oa_status}</span>
          </div>
        )}

        {work.concepts && work.concepts.length > 0 && (
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Topics:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {work.concepts.slice(0, 10).map((concept) => (
                <span key={concept.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                  {concept.display_name} ({(concept.score * 100).toFixed(0)}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {work.authorships && work.authorships.length > 0 && (
          <div className="col-span-2">
            <span className="font-medium text-gray-700">Institutions:</span>
            <div className="mt-1 space-y-1">
              {work.authorships.slice(0, 5).map((authorship, idx) => (
                authorship.institutions && authorship.institutions.length > 0 && (
                  <div key={idx} className="text-gray-600 text-sm">
                    • {authorship.author.display_name} - {authorship.institutions.map(i => i.display_name).join(', ')}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
