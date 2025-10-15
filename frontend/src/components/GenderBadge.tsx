"use client";

import { cn } from "@/lib/utils";
import { Mars, Venus, User } from "lucide-react";

type Gender = string | null | undefined;

export function GenderBadge({ gender, className }: { gender: Gender; className?: string }) {
  const g = (gender || "").toString().trim().toLowerCase();
  let color = "text-muted-foreground";
  let Icon: any = User;
  let label = gender || "";

  if (g === "male" || g === "m") {
    color = "text-sky-500";
  Icon = Mars;
    label = "Male";
  } else if (g === "female" || g === "f") {
    color = "text-pink-500";
  Icon = Venus;
    label = "Female";
  } else if (g === "non-binary" || g === "nonbinary" || g === "they" || g === "they/them" || g === "nb") {
    color = "text-zinc-400";
    Icon = User;
    label = "They/Them";
  } else if (g) {
    // Some other custom input - keep gray
    color = "text-zinc-400";
    Icon = User;
    label = gender as string;
  } else {
    color = "text-zinc-400";
    Icon = User;
    label = "";
  }

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", color, className)}>
      <Icon className="h-3.5 w-3.5" />
      {label && <span>{label}</span>}
    </span>
  );
}

export default GenderBadge;
