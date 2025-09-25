'use client';

import { useState, useRef } from 'react';

export const useAvatarUpload = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const setInitialImagePreview = (url: string | null) => {
    setImagePreview(url);
  };

  return {
    imageFile,
    imagePreview,
    fileInputRef,
    handleImageChange,
    handleAvatarClick,
    setInitialImagePreview,
  };
};
