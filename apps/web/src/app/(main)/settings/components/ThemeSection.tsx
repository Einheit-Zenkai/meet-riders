"use client";

import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeSection() {
  const { theme, setTheme, systemTheme } = useTheme();

  const value = theme === "system" ? "system" : theme ?? "system";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ToggleGroup
            type="single"
            value={value}
            onValueChange={(v) => v && setTheme(v as any)}
            className="bg-background border rounded-lg"
          >
            <ToggleGroupItem value="light" aria-label="Light">Light</ToggleGroupItem>
            <ToggleGroupItem value="dark" aria-label="Dark">Dark</ToggleGroupItem>
            <ToggleGroupItem value="system" aria-label="System">System</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardContent>
    </Card>
  );
}