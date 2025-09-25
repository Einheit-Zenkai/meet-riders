'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/context/Authcontext';

const transportModes = [
  { id: 'walking', label: 'Walking' },
  { id: 'bus', label: 'Bus' },
  { id: 'cab', label: 'Cab' },
  { id: 'auto', label: 'Auto' },
  { id: 'suv', label: 'SUV' },
  { id: 'bike', label: 'Bike' },
];

const PREFERENCE_LEVELS = { UNSELECTED: 0, PRIMARY: 1, SECONDARY: 2, TERTIARY: 3, DISLIKED: -1 } as const;

export type Preferences = Record<string, number>;

export const useProfile = () => {
  const supabase = createClient();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  // Profile states
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [punctuality, setPunctuality] = useState('on-time');
  const [idealLocation, setIdealLocation] = useState('');
  const [idealDepartureTime, setIdealDepartureTime] = useState('');
  const [university, setUniversity] = useState('');
  const [showUniversity, setShowUniversity] = useState<boolean>(true);
  
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const init: Preferences = {};
    transportModes.forEach(m => { init[m.id] = PREFERENCE_LEVELS.UNSELECTED; });
    return init;
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      setError('');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else if (profile) {
        setNickname(profile.nickname || '');
        setBio(profile.bio || '');
        setPunctuality(profile.punctuality || 'on-time');
        setIdealLocation(profile.ideal_location || '');
        setIdealDepartureTime(profile.ideal_departure_time || '');
        setUniversity(profile.university || '');
        setShowUniversity(typeof profile.show_university === 'boolean' ? profile.show_university : true);
        setAvatarUrl(profile.avatar_url || null);
      }
      setLoading(false);
    };

    loadProfile();
  }, [user, supabase]);

  const handlePreferenceClick = (modeId: string) => {
    setPreferences(prev => {
      const current = prev[modeId];
      const next = current === PREFERENCE_LEVELS.DISLIKED
        ? PREFERENCE_LEVELS.UNSELECTED
        : (current + 1) % 4;
      return { ...prev, [modeId]: next };
    });
  };

  const handleDislikeClick = (modeId: string) => {
    setPreferences(prev => ({ ...prev, [modeId]: PREFERENCE_LEVELS.DISLIKED }));
  };

  return {
    loading,
    error,
    setError,
    avatarUrl,
    // Profile data
    nickname,
    setNickname,
    bio,
    setBio,
    punctuality,
    setPunctuality,
    idealLocation,
    setIdealLocation,
    idealDepartureTime,
    setIdealDepartureTime,
    university,
    setUniversity,
    showUniversity,
    setShowUniversity,
    // Preferences
    preferences,
    handlePreferenceClick,
    handleDislikeClick,
    PREFERENCE_LEVELS,
  };
};
