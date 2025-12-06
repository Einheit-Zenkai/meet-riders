'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export const usePasswordChange = () => {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const handlePasswordChange = async () => {
    setPasswordErr('');
    setPasswordMsg('');
    
    if (newPassword.length < 6) {
      setPasswordErr('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordErr('Passwords do not match');
      return;
    }
    
    // Re-authenticate with old password to verify
    const { data: current } = await supabase.auth.getUser();
    if (!current?.user?.email) {
      setPasswordErr('You must be logged in.');
      return;
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: current.user.email,
      password: oldPassword,
    });

    if (signInErr) {
      setPasswordErr('Old password is incorrect');
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setPasswordErr(error.message);
    } else {
      setPasswordMsg('Password updated');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    oldPassword,
    setOldPassword,
    passwordMsg,
    passwordErr,
    handlePasswordChange,
  };
};
