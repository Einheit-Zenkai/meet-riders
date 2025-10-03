"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AvatarSection, PasswordSection, SettingsForm } from "./components";
import useAuthStore from "@/stores/authStore";
import { useAvatarUpload } from "./hooks/useAvatarUpload";
import { usePasswordChange } from "./hooks/usePasswordChange";
import { useProfile } from "./hooks/useProfile";

export default function SettingsPage() {
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
        <AvatarSection
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          handleImageChange={handleImageChange}
          handleAvatarClick={handleAvatarClick}
        />

        <SettingsForm
          imageFile={imageFile}
          setInitialImagePreview={setInitialImagePreview}
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
      </div>
    </div>
  );
}
