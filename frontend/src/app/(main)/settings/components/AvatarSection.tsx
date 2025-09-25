'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { User } from 'lucide-react';

interface AvatarSectionProps {
  imagePreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAvatarClick: () => void;
}

export const AvatarSection = ({
  imagePreview,
  fileInputRef,
  handleImageChange,
  handleAvatarClick,
}: AvatarSectionProps) => {
  return (
    <div className="lg:col-span-1 flex flex-col items-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Update your picture
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <button type="button" className="cursor-pointer">
                <Avatar className="w-32 h-32 text-muted-foreground border-2 border-dashed">
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
                <img 
                  src={imagePreview} 
                  alt="Selected preview" 
                  className="w-full h-full object-contain rounded-lg" 
                />
              </DialogContent>
            )}
          </Dialog>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={handleAvatarClick}
          >
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
  );
};
