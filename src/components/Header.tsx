import React from 'react';
import { DollarSign, Shield, Zap } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-yellow-400 rounded-xl">
            <DollarSign className="w-8 h-8 text-blue-900" />
          </div>
          <h1 className="text-3xl font-bold">Australian CGT Calculator</h1>
        </div>
        
        <p className="text-center text-blue-200 text-lg mb-6">
          Calculate Capital Gains Tax for Cryptocurrency & ASX Shares
        </p>

        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span>100% Private - Runs in Browser</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>FIFO Cost Basis</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>50% CGT Discount</span>
          </div>
        </div>
      </div>
    </header>
  );
};
