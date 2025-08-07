'use client';

import { useState, ChangeEvent, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input';
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bus, Car, TramFront, Bike, Walk } from 'lucide-react'; // For nice icons

export default function UserCreatePage() {
  const [nickname, setNickname] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle nickname input to allow only specific characters
  const handleNicknameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allows letters, numbers, underscore, and dot. Rejects spaces and other symbols.
    const validNickname = value.replace(/[^a-zA-Z0-9_.]/g, '');
    setNickname(validNickname);
  };

  // Handle image selection from file input
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click when the avatar is clicked
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Section - Profile Picture */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500 mb-4 text-center">
                For Students: Use your Roll Number. <br /> Others: Use your Username.
              </p>
              
              <Dialog>
                <DialogTrigger asChild>
                  <button type="button" className="cursor-pointer">
                    <Avatar className="w-32 h-32 text-gray-400 border-2 border-dashed">
                      <AvatarImage src={imagePreview || ''} alt="User profile" />
                      <AvatarFallback className="flex flex-col items-center justify-center">
                        <User className="h-12 w-12" />
                        <span>Upload</span>
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DialogTrigger>
                {imagePreview && (
                  <DialogContent className="max-w-md p-0">
                    <img src={imagePreview} alt="Selected preview" className="w-full h-full object-contain rounded-lg" />
                  </DialogContent>
                )}
              </Dialog>
              
              <Button variant="outline" className="mt-4" onClick={handleAvatarClick}>
                {imagePreview ? "Change Image" : "Select Image"}
              </Button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*"
              />

            </CardContent>
          </Card>
        </div>

        {/* Right Section - User Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tell us about yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                <Label>Gender</Label>
                <ToggleGroup type="single" variant="outline" defaultValue="they">
                  <ToggleGroupItem value="male" aria-label="Select male">♂ Male</ToggleGroupItem>
                  <ToggleGroupItem value="female" aria-label="Select female">♀ Female</ToggleGroupItem>
                  <ToggleGroupItem value="they" aria-label="Select they/them">👤 They/Them</ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label>Travel Preferences</Label>
                 <ToggleGroup type="multiple" variant="outline" className="flex flex-wrap justify-start">
                    <ToggleGroupItem value="walking"><Walk className="h-4 w-4 mr-1"/>Walking</ToggleGroupItem>
                    <ToggleGroupItem value="bus"><Bus className="h-4 w-4 mr-1"/>Bus</ToggleGroupItem>
                    <ToggleGroupItem value="cab"><Car className="h-4 w-4 mr-1"/>Cab</ToggleGroupItem>
                    <ToggleGroupItem value="auto"><TramFront className="h-4 w-4 mr-1"/>Auto</ToggleGroupItem>
                    <ToggleGroupItem value="suv"><Car className="h-4 w-4 mr-1"/>SUV</ToggleGroupItem>
                    <ToggleGroupItem value="bike"><Bike className="h-4 w-4 mr-1"/>Bike</ToggleGroupItem>
                 </ToggleGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Ideal Pickup/Drop-off Location</Label>
                <Input id="location" placeholder="e.g. Main College Gate" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Ideal time of leaving college</Label>
                <Input id="time" type="time" />
              </div>

              <Button className="w-full">Create Profile</Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}