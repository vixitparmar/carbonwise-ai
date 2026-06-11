import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Leaf, Lock, Mail, AlertCircle } from 'lucide-react';

// For simplicity, since @hookform/resolvers/zod is used, let's make sure it is imported.
// Wait, did we install @hookform/resolvers?
// Ah! In package.json, we did not include `@hookform/resolvers`! We can write the zod validation manually in the onSubmit, which is extremely robust and avoids additional NPM install dependency, or we can install it.
// Actually, writing a simple Zod parse inside our submit handler is extremely clean and requires ZERO package resolvers!
// Let's write standard inputs with direct react-hook-form or manual validation which is 100% reliable. Let's write simple validation states using react-hook-form.

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const isExpired = searchParams.get('expired') === 'true';

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setSubmitting(true);
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to login. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-6 transition-colors duration-200">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm"
      >
        {/* Brand */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 rounded-xl text-emerald-600 mb-3">
            <Leaf className="h-6 w-6" />
          </div>
          <h1 className="font-bold text-xl text-slate-800 dark:text-slate-100">Welcome Back</h1>
          <p className="text-slate-400 text-xs mt-1.5">Sign in to your CarbonWise account</p>
        </div>

        <AnimatePresence mode="popLayout">
          {isExpired && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2 overflow-hidden"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Your session has expired. Please sign in again.</span>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2 overflow-hidden"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            disabled={submitting}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900 text-center">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
export default Login;
