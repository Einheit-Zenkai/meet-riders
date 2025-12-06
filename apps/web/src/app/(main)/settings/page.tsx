"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AvatarSection, PasswordSection, SettingsForm, ThemeSection } from "./components";
import { useState } from "react";
import useAuthStore from "@/stores/authStore";
import { useAvatarUpload } from "./hooks/useAvatarUpload";
import { usePasswordChange } from "./hooks/usePasswordChange";
import { useProfile } from "./hooks/useProfile";

export default function SettingsPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { loading: profileLoading, avatarUrl } = useProfile();

  const {
    imageFile,
    imagePreview,
    fileInputRef,
    handleImageChange,
    handleAvatarClick,
    setInitialImagePreview,
  } = useAvatarUpload();

  const {
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordMsg,
    passwordErr,
    handlePasswordChange,
  } = usePasswordChange();

  // Initialize avatar preview from profile once available
  useEffect(() => {
    if (avatarUrl && !imagePreview) {
      setInitialImagePreview(avatarUrl);
    }
  }, [avatarUrl, imagePreview, setInitialImagePreview]);

  if (!user && !authLoading) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild variant="outline"><Link href="/dashboard">← Back</Link></Button>
        <div className="text-lg font-semibold">Settings</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-6">
          <AvatarSection
            imagePreview={imagePreview}
            fileInputRef={fileInputRef}
            handleImageChange={handleImageChange}
            handleAvatarClick={handleAvatarClick}
          />

          {/* Appearance toggle in settings as requested */}
          <ThemeSection />

          {/* Rectangular button to reveal Change Password, inline on the same page */}
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Security</div>
                <div className="text-sm text-muted-foreground">Change your password</div>
              </div>
              <Button onClick={() => setShowPassword((s) => !s)} className="rounded-lg">
                {showPassword ? 'Hide' : 'Change Password'}
              </Button>
            </div>
            {showPassword && (
              <div className="mt-4">
                <PasswordSection
                  oldPassword={oldPassword}
                  setOldPassword={setOldPassword}
                  newPassword={newPassword}
                  setNewPassword={setNewPassword}
                  confirmPassword={confirmPassword}
                  setConfirmPassword={setConfirmPassword}
                  passwordErr={passwordErr}
                  passwordMsg={passwordMsg}
                  handlePasswordChange={handlePasswordChange}
                />
              </div>
            )}
          </div>
        </div>

        <SettingsForm
          imageFile={imageFile}
          setInitialImagePreview={setInitialImagePreview}
        />
      </div>
    </div>
  );
}
