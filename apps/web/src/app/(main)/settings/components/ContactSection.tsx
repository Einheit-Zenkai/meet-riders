'use client';

import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";

interface ContactSectionProps {
  phone: string;
  setPhone: (value: string) => void;
  showPhone: boolean;
  setShowPhone: (value: boolean) => void;
}

export const ContactSection = ({ phone, setPhone, showPhone, setShowPhone }: ContactSectionProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone number (private by default)</Label>
        <Input
          id="phone"
          placeholder="e.g., +91 98765 43210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label className="inline-flex items-center gap-2 text-sm mt-1">
          <input
            type="checkbox"
            checked={showPhone}
            onChange={(e) => setShowPhone(e.target.checked)}
          />
          Show my contact to people who join my ride
        </label>
        <p className="text-xs text-muted-foreground">
          Your phone is never shown on your public profile; only members of your ride see it in the joined popup.
        </p>
      </div>
    </>
  );
};
