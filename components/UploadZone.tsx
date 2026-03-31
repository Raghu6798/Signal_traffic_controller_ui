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
          ? "border-white bg-white/10 scale-[1.02] shadow-xl shadow-white/5"
          : "border-border bg-card hover:bg-muted hover:border-white/20",
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
      <UploadCloud className="h-5 w-5 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">
        Upload a signal timing sheet
      </span>
    </div>
  );
}
