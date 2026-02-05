"use client";

import { UploadCloud } from "lucide-react";
import { useState, useRef } from "react";
import { clsx } from "clsx";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, disabled }: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "cursor-pointer rounded-lg border-2 border-dashed px-6 py-4 text-center transition-all duration-300",
        "flex items-center justify-center gap-3",
        isDragOver
          ? "border-blue-500 bg-blue-500/10 scale-[1.02]"
          : "border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf"
        disabled={disabled}
      />
      <UploadCloud className="h-5 w-5 text-zinc-400" />
      <span className="text-sm font-medium text-zinc-300">
        Upload a signal timing sheet
      </span>
    </div>
  );
}
