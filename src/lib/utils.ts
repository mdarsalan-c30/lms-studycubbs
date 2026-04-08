import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateJitsiRoomName(batchName: string, sessionId: string) {
  // Sanitize name: alphanumeric only, replace spaces with underscores
  const cleanName = batchName.replace(/[^a-zA-Z0-9]/g, '_');
  // Use a complex prefix and the full session ID for ultra-uniqueness
  return `StudyCubs_LMS_Stable_${cleanName}_${sessionId.replace(/[^a-zA-Z0-9]/g, '')}`;
}
