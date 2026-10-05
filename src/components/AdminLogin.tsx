import React, { useState } from 'react';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { adminLogin } from '../lib/api';

interface AdminLoginProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the administrator password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminLogin(password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid password. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
        <span>Back to Public Library</span>
      </button>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-stone-900 text-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Librarian Sign In
          </h2>
          <p className="text-xs text-stone-500 mt-1.5">
            Log in to manage catalog books, upload PDFs, and manage categories.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1.5">
              Administrator Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password..."
                className="w-full px-3 py-2 pl-9 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-900/20 focus:border-amber-900"
              />
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5">
              Default password for testing: <span className="font-mono text-stone-700 bg-stone-100 px-1 py-0.5 rounded">admin123</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Enter Admin Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-5 border-t border-stone-100 text-center">
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Only authorized administrators may upload and manage library records. All session tokens are cryptographically signed.
          </p>
        </div>
      </div>
    </div>
  );
};
