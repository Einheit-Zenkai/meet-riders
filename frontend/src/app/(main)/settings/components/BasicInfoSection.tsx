'use client';

import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Textarea } from '@/components/ui/textarea';

interface BasicInfoSectionProps {
  nickname: string;
  setNickname: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  university: string;
  setUniversity: (value: string) => void;
  showUniversity: boolean;
  setShowUniversity: (value: boolean) => void;
  punctuality: string;
  setPunctuality: (value: string) => void;
  idealLocation: string;
  setIdealLocation: (value: string) => void;
  idealDepartureTime: string;
  setIdealDepartureTime: (value: string) => void;
}

export const BasicInfoSection = ({
  nickname,
  setNickname,
  bio,
  setBio,
  university,
  setUniversity,
  showUniversity,
  setShowUniversity,
  punctuality,
  setPunctuality,
  idealLocation,
  setIdealLocation,
  idealDepartureTime,
  setIdealDepartureTime,
}: BasicInfoSectionProps) => {
  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const validNickname = value.replace(/[^a-zA-Z0-9_.]/g, '');
    setNickname(validNickname);
  };

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
  };

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="nickname">Nickname</Label>
        <Input 
          id="nickname" 
          placeholder="e.g. awesome_user.123" 
          value={nickname} 
          onChange={handleNicknameChange} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio / About Me</Label>
        <Textarea 
          id="bio" 
          placeholder="e.g. 3rd year CS student, friendly and loves music!" 
          value={bio} 
          onChange={handleBioChange} 
          className="min-h-[80px]" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="university">University (optional)</Label>
        <Input 
          id="university" 
          placeholder="e.g. NIT Surat" 
          value={university} 
          onChange={(e) => setUniversity(e.target.value)} 
        />
        <label className="inline-flex items-center gap-2 text-sm mt-1">
          <input 
            type="checkbox" 
            checked={showUniversity} 
            onChange={(e) => setShowUniversity(e.target.checked)} 
          />
          Display my university publicly
        </label>
      </div>

      <div className="space-y-2">
        <Label>Punctuality</Label>
        <ToggleGroup 
          type="single" 
          variant="outline" 
          value={punctuality} 
          className="flex flex-wrap justify-start" 
          onValueChange={(value) => { if(value) setPunctuality(value) }}
        >
          <ToggleGroupItem value="on-time" aria-label="Select always on time">
            Always on time
          </ToggleGroupItem>
          <ToggleGroupItem value="usually-on-time" aria-label="Select usually on time">
            Usually on time
          </ToggleGroupItem>
          <ToggleGroupItem value="flexible" aria-label="Select flexible">
            Flexible
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Ideal Pickup/Drop-off Location</Label>
        <Input 
          id="location" 
          placeholder="e.g. Main College Gate" 
          value={idealLocation} 
          onChange={(e) => setIdealLocation(e.target.value)} 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="time">Ideal time of leaving college</Label>
        <Input 
          id="time" 
          type="time" 
          value={idealDepartureTime} 
          onChange={(e) => setIdealDepartureTime(e.target.value)} 
        />
      </div>
    </>
  );
};
