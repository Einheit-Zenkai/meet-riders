'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export const usePasswordChange = () => {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      setPasswordErr(error.message);
    } else {
      setPasswordMsg('Password updated');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return {
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordMsg,
    passwordErr,
    handlePasswordChange,
  };
};
