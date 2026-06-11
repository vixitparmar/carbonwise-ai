import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

type ProfileFormInputs = {
  name: string;
  carbonGoal: number;
};

type PasswordFormInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: profileSubmitting }
  } = useForm<ProfileFormInputs>({
    defaultValues: {
      name: user?.name || '',
      carbonGoal: user?.carbonGoal || 500
    }
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { isSubmitting: passwordSubmitting }
  } = useForm<PasswordFormInputs>();

  const onUpdateProfile = async (data: ProfileFormInputs) => {
    setProfileSuccess(null);
    setProfileError(null);
    try {
      const res = await api.put('/auth/profile', {
        name: data.name,
        carbonGoal: Number(data.carbonGoal)
      });
      updateUser(res.data.user);
      setProfileSuccess('Profile details and carbon goal updated successfully.');
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Failed to update profile.');
    }
  };

  const onChangePassword = async (data: PasswordFormInputs) => {
    setPasswordSuccess(null);
    setPasswordError(null);

    if (data.newPassword !== data.confirmPassword) {
      setPasswordError('New password and confirm password fields do not match.');
      return;
    }

    try {
      await api.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setPasswordSuccess('Password updated successfully.');
      resetPasswordForm();
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Failed to change password. Please check current password.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Adjust your profile name, customize carbon footprint limit goals, or change credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation Info */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-3">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <SettingsIcon className="h-4.5 w-4.5" />
              Settings Guide
            </h3>
            <p className="text-slate-500 leading-relaxed">
              <strong>Carbon Goal</strong> is the monthly carbon limit in kg CO2 you wish to stay under. 
            </p>
            <p className="text-slate-500 leading-relaxed">
              We recommend setting a goal based on your monthly average. The global standard for carbon neutrality targets a maximum of 350 kg CO2/month per individual.
            </p>
          </div>
        </div>

        {/* Profile Card & Password Card */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
              <User className="h-5 w-5 text-blue-600" />
              Profile details
            </h2>

            {profileSuccess && (
              <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  {...registerProfile('name', { required: true })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Monthly Carbon Target Goal (kg CO₂)</label>
                <input
                  type="number"
                  {...registerProfile('carbonGoal', { required: true, min: 10 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={profileSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {profileSubmitting ? 'Updating...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="font-semibold text-base text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
              <Lock className="h-5 w-5 text-blue-600" />
              Change Password
            </h2>

            {passwordSuccess && (
              <div className="mb-5 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-500" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-5 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('currentPassword', { required: true })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('newPassword', { required: true, minLength: 6 })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword('confirmPassword', { required: true })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={passwordSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
              >
                {passwordSubmitting ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Settings;
