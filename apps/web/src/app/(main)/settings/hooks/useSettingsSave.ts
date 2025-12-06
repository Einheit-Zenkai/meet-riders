'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import useAuthStore from '@/stores/authStore';
import { Preferences } from './useProfile';

export const useSettingsSave = () => {
  const supabase = createClient();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');

  const saveSettings = async (
    profileData: {
      username: string;
      nickname: string;
      bio: string;
      punctuality: string;
      idealLocation: string;
      idealDepartureTime: string;
      university: string;
      showUniversity: boolean;
      phone: string;
      showPhone: boolean;
      preferences: Preferences;
    },
    imageFile: File | null,
    setError: (error: string) => void
  ) => {
    if (!user) return;
    
    setSaveLoading(true);
    setError('');
    setMessage('');

    // Validate username is not empty
    if (!profileData.username || profileData.username.trim() === '') {
      setError('Username is required');
      setSaveLoading(false);
      return;
    }

    // Check if username is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', profileData.username)
      .neq('id', user.id)
      .maybeSingle();

    if (checkError) {
      setError('Error checking username availability');
      setSaveLoading(false);
      return;
    }

    if (existingUser) {
      setError('Username is already taken. Please choose a different one.');
      setSaveLoading(false);
      return;
    }

    let avatar_url: string | null = null;
    
    // Handle image upload
    if (imageFile) {
      // Debug: Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session:', session?.user?.id);
      console.log('User from context:', user.id);
      
      // Use user folder structure for better RLS policy support
      const fileExt = imageFile.name.split('.').pop() || 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;
      console.log('Uploading to:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, imageFile, { 
          upsert: true, // Allow overwriting existing avatar
          contentType: imageFile.type 
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        setError(`Image upload failed: ${uploadError.message}`);
        setSaveLoading(false);
        return;
      }

      const { data: urlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(uploadData.path);
      avatar_url = urlData.publicUrl;
    }

    // Prepare profile data for save
    const profileDataToSave: Record<string, any> = {
      username: profileData.username,
      nickname: profileData.nickname,
      bio: profileData.bio,
      punctuality: profileData.punctuality,
      ideal_location: profileData.idealLocation,
      ideal_departure_time: profileData.idealDepartureTime,
      phone_number: profileData.phone || null,
      show_phone: !!profileData.showPhone,
      updated_at: new Date(),
    };
    
    profileDataToSave.university = profileData.university || null;
    profileDataToSave.show_university = profileData.showUniversity;
    
    if (avatar_url) {
      profileDataToSave.avatar_url = avatar_url;
    }

    // Update profile in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileDataToSave)
      .eq('id', user.id);

    if (updateError) {
      // Handle specific error for username uniqueness constraint
      if (updateError.message.includes('profiles_username_key') || updateError.code === '23505') {
        setError('Username is already taken. Please choose a different one.');
      } else {
        setError(updateError.message);
      }
    } else {
      setMessage('Settings saved');
      // Redirect to dashboard after successful save
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
    
    setSaveLoading(false);
  };

  return {
    saveLoading,
    message,
    saveSettings,
  };
};
