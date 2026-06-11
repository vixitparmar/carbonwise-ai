import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  FileText,
  UploadCloud,
  FileCode,
  Coins,
  CheckCircle2,
  AlertCircle,
  Leaf
} from 'lucide-react';

export const Scanner: React.FC = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'bill' | 'receipt'>('bill');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setResult(null);
    setSuccess(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be smaller than 5MB.');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');
      
      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = activeTab === 'bill' ? '/ai/scan-bill' : '/ai/scan-receipt';
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResult(data.scanResult);
      setSuccess(data.message || 'File scanned and log created successfully!');
      setError(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['activitiesList'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      refreshUser();
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to process document. Please try again.');
      setSuccess(null);
    }
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    scanMutation.mutate();
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          AI Document Scanner
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Upload electricity bills or shopping receipts. Gemini AI automatically parses consumption and logs carbon footprints.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={() => {
            setActiveTab('bill');
            resetScanner();
          }}
          className={`px-6 py-3 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'bill'
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Electricity Bill OCR
          {activeTab === 'bill' && (
            <motion.div
              layoutId="activeScannerTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
        <button
          onClick={() => {
            setActiveTab('receipt');
            resetScanner();
          }}
          className={`px-6 py-3 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'receipt'
              ? 'text-blue-600 dark:text-blue-500'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          Shopping Receipt Scanner
          {activeTab === 'receipt' && (
            <motion.div
              layoutId="activeScannerTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="upload-form"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm"
              >
                <form onSubmit={handleUploadSubmit} className="space-y-6">
                  
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Upload Zone */}
                  <motion.div 
                    whileHover={{ scale: 1.005 }}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center bg-slate-50/20 dark:bg-slate-950/20 transition hover:border-slate-300 dark:hover:border-slate-800 relative cursor-pointer"
                  >
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      id="scanner-upload"
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-4">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Upload preview"
                            className="h-32 mx-auto rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="h-16 w-16 mx-auto bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl flex items-center justify-center">
                            <FileText className="h-8 w-8" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{selectedFile.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="text-xs text-red-600 hover:underline font-medium relative z-10"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="h-12 w-12 mx-auto bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center text-slate-400">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Drag and drop file, or <span className="text-blue-600 dark:text-blue-400">browse</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">Supports PDF, PNG, JPG, or WEBP up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    disabled={!selectedFile || scanMutation.isPending}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-lg font-semibold text-sm transition shadow-sm disabled:cursor-not-allowed cursor-pointer"
                  >
                    {scanMutation.isPending
                      ? `Processing via Gemini AI...`
                      : activeTab === 'bill'
                      ? 'Scan Utility Bill'
                      : 'Scan Shopping Receipt'}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              /* Scanned Results Display Card */
              <motion.div 
                key="scanned-results"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6"
              >
                
                {/* Success Notification banner inside */}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-bold">Entry Logged Automatically</p>
                      <p className="mt-1 leading-relaxed">{success}</p>
                      <div className="flex items-center gap-1.5 mt-2 text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider text-[10px]">
                        <Coins className="h-3.5 w-3.5" />
                        <span>+100 Green Coins Signup/Scan Bonus Earned!</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Scanned Details Title */}
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-md">
                      {activeTab === 'bill' ? 'Utility Invoice Details' : 'Shopping Invoice details'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Extracted via Gemini multimodal model</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Carbon Emitted</span>
                    <p className="text-xl font-black text-red-600 dark:text-red-500">
                      {activeTab === 'bill' ? result.carbonEmissions : result.totalCarbonEmissions} kg CO₂
                    </p>
                  </div>
                </div>

                {/* Bill Details */}
                {activeTab === 'bill' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Utility Provider</span>
                      <p className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-300">{result.provider}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Bill Date</span>
                      <p className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-300">
                        {new Date(result.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-center">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Consumption</span>
                      <p className="text-sm font-bold mt-1 text-slate-700 dark:text-slate-300">
                        {result.consumption} {result.units}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Receipt Items Table */
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-2">
                      <span>Merchant: {result.merchant}</span>
                      <span>Date: {new Date(result.date).toLocaleDateString()}</span>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <tr>
                            <th className="px-4 py-2.5">Item Name</th>
                            <th className="px-4 py-2.5">Category</th>
                            <th className="px-4 py-2.5 text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                          {result.items?.map((item: any, i: number) => (
                            <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                              <td className="px-4 py-2.5 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                              <td className="px-4 py-2.5 text-xs">
                                <span className={`px-2 py-0.5 rounded-full capitalize font-semibold ${
                                  item.category === 'food'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                                    : item.category === 'clothing'
                                    ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-600'
                                    : item.category === 'electronics'
                                    ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600'
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-500'
                                }`}>
                                  {item.category}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-right font-semibold text-slate-500">${item.price.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={resetScanner}
                  className="w-full py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-lg transition cursor-pointer"
                >
                  Scan Another Document
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Sidebar Instructions Card */}
        <motion.div 
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-xs h-fit"
        >
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <FileCode className="h-4.5 w-4.5 text-blue-600" />
            Scanner Guidelines
          </h3>

          <div className="space-y-4 text-slate-500 dark:text-slate-400 leading-relaxed">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">1. Uploading Utility Invoices</p>
              <p className="mt-1">
                Upload images or PDF files of residential electric or water bills. The parser extracts the billing month consumption in kWh or Liters and auto-calculates emissions.
              </p>
            </div>
            
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300">2. Uploading Shopping Receipts</p>
              <p className="mt-1">
                Upload receipts from supermarkets or electronics shops. The AI groups items, identifies carbon-heavy goods (like beef or clothing), and totals emissions.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-850 flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-wider text-[10px]">
              <Leaf className="h-3.5 w-3.5" />
              <span>Smart scan auto-logs details</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};
export default Scanner;
