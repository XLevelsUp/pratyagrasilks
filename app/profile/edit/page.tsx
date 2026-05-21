'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  User,
  Camera,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Input from '@/components/ui/Input';

const PHONE_REGEX = /^\d{10}$/;
const MAX_PASSWORD_LENGTH = 20;

// ── Inline alert helper ───────────────────────────────────────────────────────
function Alert({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm ${
        isSuccess
          ? 'bg-green-50 text-green-800 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
      }`}
    >
      {isSuccess ? (
        <CheckCircle className='w-4 h-4 flex-shrink-0' />
      ) : (
        <AlertCircle className='w-4 h-4 flex-shrink-0' />
      )}
      {message}
    </div>
  );
}

// ── Password input with show/hide ────────────────────────────────────────────
function PwdInput({
  id,
  label,
  value,
  onChange,
  error,
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className='w-full'>
      <label
        htmlFor={id}
        className='block text-sm font-medium text-gray-700 mb-1'
      >
        {label}
      </label>
      <div className='relative'>
        <input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={MAX_PASSWORD_LENGTH}
          autoComplete={autoComplete}
          className={`w-full px-4 py-2 pr-10 border rounded-md outline-none transition-colors focus:ring-2 ${
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-gray-300 focus:ring-primary focus:border-primary'
          }`}
        />
        <button
          type='button'
          tabIndex={-1}
          onClick={() => setShow((v) => !v)}
          className='absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600'
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
        </button>
      </div>
      <p className='mt-1 text-xs min-h-[1rem] text-red-600' aria-live='polite'>
        {error ?? ''}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  // ── Personal info state ───────────────────────────────────────────────────
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [infoErrors, setInfoErrors] = useState<{
    fullName?: string;
    phone?: string;
  }>({});
  const [infoStatus, setInfoStatus] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [infoSaving, setInfoSaving] = useState(false);

  // ── Password state ────────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdErrors, setPwdErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});
  const [pwdStatus, setPwdStatus] = useState<{
    type: 'success' | 'error';
    msg: string;
  } | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  // ── Redirect if not logged in ─────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  // ── Pre-fill from existing data ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const fetchCustomer = async () => {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const { customer } = await res.json();
        setFullName(customer?.full_name ?? user.user_metadata?.full_name ?? '');
        setPhone(customer?.phone ?? '');
        setAvatarUrl(
          customer?.avatar_url ?? user.user_metadata?.avatar_url ?? null,
        );
      }
    };
    fetchCustomer();
  }, [user]);

  if (loading || !user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary' />
      </div>
    );
  }

  // ── Avatar handlers ───────────────────────────────────────────────────────
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setInfoStatus({ type: 'error', msg: 'Image must be under 2 MB.' });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return null;

    try {
      const fd = new FormData();
      fd.append('file', avatarFile);
      const res = await fetch('/api/profile/photo', {
        method: 'POST',
        body: fd,
      });

      const text = await res.text();
      let data: any = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error('JSON parse error', e);
        }
      }

      if (!res.ok) {
        throw new Error(
          data.error ?? `Server error: ${res.status} ${res.statusText}`,
        );
      }

      if (!data.url) return null;

      const cacheBustedUrl = `${data.url}?t=${Date.now()}`;
      setAvatarUrl(cacheBustedUrl);
      setAvatarPreview(cacheBustedUrl);
      return cacheBustedUrl;
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
  };

  // ── Personal info submit ──────────────────────────────────────────────────
  const validateInfo = () => {
    const errs: typeof infoErrors = {};
    if (!fullName.trim() || fullName.trim().length < 2)
      errs.fullName = 'Full name must be at least 2 characters.';
    if (fullName.trim().length > 100)
      errs.fullName = 'Full name must not exceed 100 characters.';
    if (phone && !PHONE_REGEX.test(phone))
      errs.phone = 'Phone must be exactly 10 digits.';
    setInfoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInfo()) return;
    setInfoSaving(true);
    setInfoStatus(null);
    try {
      // Upload avatar first if a new file was chosen
      if (avatarFile) await uploadAvatar();

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (typeof refreshUser === 'function') {
        await refreshUser();
      }
      setAvatarFile(null);
      setInfoStatus({ type: 'success', msg: 'Profile updated successfully!' });

      setTimeout(() => {
        router.push('/profile');
      }, 300);
    } catch (err: any) {
      setInfoStatus({ type: 'error', msg: err.message });
    } finally {
      setInfoSaving(false);
    }
  };

  // ── Password submit ───────────────────────────────────────────────────────
  const validatePwd = () => {
    const errs: typeof pwdErrors = {};
    if (!currentPwd) errs.current = 'Current password is required.';
    if (!newPwd || newPwd.length < 8)
      errs.new = 'New password must be at least 8 characters.';
    if (newPwd.length > MAX_PASSWORD_LENGTH)
      errs.new = `Password must not exceed ${MAX_PASSWORD_LENGTH} characters.`;
    if (newPwd !== confirmPwd) errs.confirm = 'Passwords do not match.';
    setPwdErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePwd()) return;
    setPwdSaving(true);
    setPwdStatus(null);
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: currentPwd,
          newPassword: newPwd,
          confirmPassword: confirmPwd,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdStatus({ type: 'success', msg: 'Password changed successfully!' });
    } catch (err: any) {
      setPwdStatus({ type: 'error', msg: err.message });
    } finally {
      setPwdSaving(false);
    }
  };

  const displayAvatar = avatarPreview ?? avatarUrl;
  const initials = (fullName || user.user_metadata?.full_name || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b'>
        <div className='container mx-auto px-4 py-6'>
          <Link
            href='/profile'
            className='inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-4'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to My Account
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>Edit Profile</h1>
          <p className='text-gray-500 mt-1'>
            Update your personal information and account settings
          </p>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8 max-w-2xl space-y-6'>
        {/* ── Section 1: Personal Info ── */}
        <form
          onSubmit={handleInfoSubmit}
          noValidate
          className='bg-white rounded-lg shadow-md p-6 space-y-5'
        >
          <h2 className='text-lg font-semibold text-gray-900 border-b pb-3'>
            Personal Information
          </h2>

          {/* Avatar */}
          <div className='flex items-center gap-5'>
            <div className='relative w-20 h-20 flex-shrink-0'>
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt='Profile photo'
                  fill
                  className='rounded-full object-cover'
                />
              ) : (
                <div className='w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center'>
                  <span className='text-2xl font-bold text-primary'>
                    {initials}
                  </span>
                </div>
              )}
              <button
                type='button'
                onClick={() => fileRef.current?.click()}
                className='absolute bottom-0 right-0 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors'
                aria-label='Change profile photo'
              >
                <Camera className='w-3.5 h-3.5' />
              </button>
            </div>
            <div>
              <label
                htmlFor='avatar-upload'
                className='block text-sm font-medium text-gray-700 cursor-pointer'
              >
                Profile Photo
              </label>
              <p className='text-xs text-gray-400 mt-0.5'>
                JPG, PNG or WebP · max 2 MB
              </p>
              <button
                type='button'
                onClick={() => fileRef.current?.click()}
                className='mt-2 text-xs text-primary hover:underline'
              >
                {displayAvatar ? 'Change photo' : 'Upload photo'}
              </button>
            </div>
            <input
              id='avatar-upload'
              ref={fileRef}
              type='file'
              accept='image/jpeg,image/png,image/webp'
              className='hidden'
              onChange={handleAvatarChange}
            />
          </div>

          {/* Full Name */}
          <Input
            id='fullName'
            name='fullName'
            label='Full Name *'
            type='text'
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              if (infoErrors.fullName)
                setInfoErrors((p) => ({ ...p, fullName: undefined }));
            }}
            placeholder='Your full name'
            maxLength={100}
            autoComplete='name'
            error={infoErrors.fullName}
          />

          {/* Phone */}
          <Input
            id='phone'
            name='phone'
            label='Phone Number'
            type='tel'
            value={phone}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 10);
              setPhone(v);
              if (infoErrors.phone)
                setInfoErrors((p) => ({ ...p, phone: undefined }));
            }}
            placeholder='10-digit mobile number'
            maxLength={10}
            autoComplete='tel'
            error={infoErrors.phone}
          />

          {/* Email (read-only) */}
          <div>
            <label
              htmlFor='email-display'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Email Address
            </label>
            <input
              id='email-display'
              type='email'
              readOnly
              disabled
              value={user.email}
              className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600 text-sm outline-none cursor-not-allowed'
            />
            <p className='mt-1 text-xs text-gray-400'>
              To change your email, contact support.
            </p>
          </div>

          {infoStatus && (
            <Alert type={infoStatus.type} message={infoStatus.msg} />
          )}

          <button
            type='submit'
            disabled={infoSaving}
            className='w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {infoSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>

        {/* ── Section 2: Change Password ── */}
        <form
          onSubmit={handlePwdSubmit}
          noValidate
          className='bg-white rounded-lg shadow-md p-6 space-y-5'
        >
          <h2 className='text-lg font-semibold text-gray-900 border-b pb-3'>
            Change Password
          </h2>

          <PwdInput
            id='currentPassword'
            label='Current Password *'
            value={currentPwd}
            onChange={(v) => {
              setCurrentPwd(v);
              if (pwdErrors.current)
                setPwdErrors((p) => ({ ...p, current: undefined }));
            }}
            error={pwdErrors.current}
            autoComplete='current-password'
          />
          <PwdInput
            id='newPassword'
            label={`New Password * (max ${MAX_PASSWORD_LENGTH} characters)`}
            value={newPwd}
            onChange={(v) => {
              setNewPwd(v);
              if (pwdErrors.new)
                setPwdErrors((p) => ({ ...p, new: undefined }));
            }}
            error={pwdErrors.new}
            autoComplete='new-password'
          />
          <PwdInput
            id='confirmPassword'
            label='Confirm New Password *'
            value={confirmPwd}
            onChange={(v) => {
              setConfirmPwd(v);
              if (pwdErrors.confirm)
                setPwdErrors((p) => ({ ...p, confirm: undefined }));
            }}
            error={pwdErrors.confirm}
            autoComplete='new-password'
          />

          {pwdStatus && <Alert type={pwdStatus.type} message={pwdStatus.msg} />}

          <button
            type='submit'
            disabled={pwdSaving}
            className='w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {pwdSaving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
