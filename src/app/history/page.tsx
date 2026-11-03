'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Download,
  ArrowRight,
  Filter,
  Camera,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { UserRepository } from '@/lib/storage/userRepository';
import { FoodAssessment, AssessmentStatus } from '@/types/nutrition';
import StatusBadge from '@/components/nutrition/StatusBadge';

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<FoodAssessment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AssessmentStatus>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const list = UserRepository.getHistory();
    setHistory(list);
  };

  const handleDelete = (id: string) => {
    UserRepository.deleteAssessment(id);
    loadHistory();
    setDeleteConfirmId(null);
  };

  const handleClearAll = () => {
    if (
      window.confirm('Are you sure you want to delete all saved analyses? This cannot be undone.')
    ) {
      UserRepository.saveAllHistory([]);
      setHistory([]);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = UserRepository.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutriagent-history-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.productName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-beige-200 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5F0FA] text-[#254F75] border border-[#ABCFF0] text-xs font-semibold mb-1">
            <HistoryIcon className="w-3.5 h-3.5 text-[#254F75]" />
            <span>Saved Records</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-coffee-950 tracking-tight">
            Analysis History
          </h1>
          <p className="text-xs sm:text-sm text-coffee-600">
            Review past food scans, check rule reasoning, or manage your stored records.
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="btn-pencil-blue text-xs py-2 px-3.5 font-semibold"
              title="Export all data to a private JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleClearAll}
              className="btn-pencil-peach text-xs py-2 px-3.5 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card-warm bg-white border border-beige-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-subtle">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-coffee-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by food name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-beige-50 border border-beige-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coffee-700 text-coffee-950"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          <span className="text-xs font-semibold text-coffee-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'fits_preferences', label: 'Fits' },
            { id: 'review_carefully', label: 'Review' },
            { id: 'potential_conflict', label: 'Conflict' },
            { id: 'not_enough_information', label: 'Incomplete' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-coffee-800 text-[#FAF7F2]'
                  : 'bg-beige-50 text-coffee-700 hover:bg-beige-200 border border-beige-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Cards List */}
      {filteredHistory.length === 0 ? (
        <div className="card-warm bg-white border border-beige-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-beige-100 flex items-center justify-center mx-auto text-coffee-500">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-serif font-bold text-coffee-950">
              No Matching Analyses Found
            </h3>
            <p className="text-xs text-coffee-600 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search terms or status filter.'
                : 'You have not scanned or evaluated any food products yet.'}
            </p>
          </div>
          <Link href="/scan" className="btn-pencil-brown text-xs py-2 px-5 inline-flex">
            Scan a Product Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="card-warm bg-white border border-beige-200 p-5 space-y-3.5 hover:border-coffee-400 transition-all shadow-subtle group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-serif font-bold text-coffee-950 group-hover:text-coffee-800">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-coffee-500">{item.brand || 'Packaged Grocery'}</p>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </div>

                <p className="text-xs text-coffee-700 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                {item.personalizedReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.personalizedReasons.slice(0, 2).map((r) => (
                      <span
                        key={r.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-beige-100 border border-beige-200 text-coffee-700 truncate max-w-[220px]"
                      >
                        {r.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-beige-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-coffee-500">
                  {new Date(item.assessedAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {deleteConfirmId === item.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-0.5 rounded bg-beige-200 text-coffee-700 text-[10px]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(item.id)}
                      className="text-coffee-400 hover:text-pencil-peach-600 p-1"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <Link
                    href={`/results/${item.id}`}
                    className="btn-pencil-sage text-xs py-1 px-3 font-semibold"
                  >
                    <span>View Verdict</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
