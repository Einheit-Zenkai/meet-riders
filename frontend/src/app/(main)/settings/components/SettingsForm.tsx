'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicInfoSection, TravelPreferences, DangerZone } from './index';
import { useProfile } from '../hooks/useProfile';
import { useSettingsSave } from '../hooks/useSettingsSave';

interface SettingsFormProps {
  imageFile: File | null;
  setInitialImagePreview: (url: string | null) => void;
}

export const SettingsForm = ({ imageFile, setInitialImagePreview }: SettingsFormProps) => {
  const {
    loading,
    error,
    setError,
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
    preferences,
    handlePreferenceClick,
    handleDislikeClick,
    PREFERENCE_LEVELS,
  } = useProfile();

  const { saveLoading, message, saveSettings } = useSettingsSave();

  const handleSave = async () => {
    await saveSettings(
      {
        nickname,
        bio,
        punctuality,
        idealLocation,
        idealDepartureTime,
        university,
        showUniversity,
        preferences,
      },
      imageFile,
      setError
    );
  };

  if (loading) {
    return (
      <div className="lg:col-span-3 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3 flex flex-col justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BasicInfoSection
            nickname={nickname}
            setNickname={setNickname}
            bio={bio}
            setBio={setBio}
            university={university}
            setUniversity={setUniversity}
            showUniversity={showUniversity}
            setShowUniversity={setShowUniversity}
            punctuality={punctuality}
            setPunctuality={setPunctuality}
            idealLocation={idealLocation}
            setIdealLocation={setIdealLocation}
            idealDepartureTime={idealDepartureTime}
            setIdealDepartureTime={setIdealDepartureTime}
          />

          <TravelPreferences
            preferences={preferences}
            handlePreferenceClick={handlePreferenceClick}
            handleDislikeClick={handleDislikeClick}
            PREFERENCE_LEVELS={PREFERENCE_LEVELS}
          />

          {error && <p className="text-destructive text-center text-sm mb-4">{error}</p>}
          {message && <p className="text-green-600 text-center text-sm mb-4">{message}</p>}
          
          <Button className="w-full" onClick={handleSave} disabled={saveLoading}>
            {saveLoading ? 'Saving…' : 'Save Settings'}
          </Button>

          <DangerZone setError={setError} setMessage={() => {}} />
        </CardContent>
      </Card>
    </div>
  );
};
