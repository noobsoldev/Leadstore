
import React from 'react';
import { ExternalLink, Star, Phone, MapPin, Globe, Trash2 } from 'lucide-react';
import { Business } from '../types';

interface BusinessTableProps {
  businesses: Business[];
  onDelete: (id: string) => void;
}

const BusinessTable: React.FC<BusinessTableProps> = ({ businesses, onDelete }) => {
  if (businesses.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Business</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Location & Contact</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reputation</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Links</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {businesses.map((biz) => (
              <tr key={biz.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900">{biz.name}</div>
                  <div className="text-xs text-gray-400 uppercase mt-0.5 tracking-tight">Public Record</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-1">
                    <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{biz.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} className="shrink-0 text-gray-400" />
                    <span>{biz.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium text-gray-900">{biz.rating}</span>
                  </div>
                  <div className="text-xs text-gray-500">{biz.reviewCount} reviews</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    {biz.website !== 'N/A' && (
                      <a
                        href={biz.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        title="Visit Website"
                      >
                        <Globe size={16} />
                      </a>
                    )}
                    <a
                      href={biz.profileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      title="Google Maps Profile"
                    >
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onDelete(biz.id)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove record"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BusinessTable;
