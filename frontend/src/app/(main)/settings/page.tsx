'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/Authcontext';
import { AvatarSection, PasswordSection, SettingsForm } from './components';
import { useAvatarUpload } from './hooks/useAvatarUpload';
import { usePasswordChange } from './hooks/usePasswordChange';
import { useProfile } from './hooks/useProfile';

export default function SettingsPage() {
  const { loading: authLoading } = useAuth();
  const { loading: profileLoading, avatarUrl } = useProfile();
  
  // Avatar upload hook
  const {
    imageFile,
    imagePreview,
    fileInputRef,
    handleImageChange,
    handleAvatarClick,
    setInitialImagePreview,
  } = useAvatarUpload();

  // Password change hook
  const {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordMsg,
    passwordErr,
    handlePasswordChange,
  } = usePasswordChange();

  // Set initial avatar preview when profile loads
  useEffect(() => {
    if (avatarUrl && !imagePreview) {
      setInitialImagePreview(avatarUrl);
    }
  }, [avatarUrl, imagePreview, setInitialImagePreview]);

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AvatarSection
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
          handleAvatarClick={handleAvatarClick}
        />

        <PasswordSection
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          passwordErr={passwordErr}
          passwordMsg={passwordMsg}
          handlePasswordChange={handlePasswordChange}
        />

        <SettingsForm
          imageFile={imageFile}
          setInitialImagePreview={setInitialImagePreview}
        />
      </div>
    </div>
  );
}
