import React from 'react';
import { User } from 'lucide-react';

interface OwnerInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const OwnerInput: React.FC<OwnerInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
        Report Owner Name (Optional)
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <User className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          id="ownerName"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Tom Lee"
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm 
                     placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition-colors"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        This name will appear on your PDF reports
      </p>
    </div>
  );
};
