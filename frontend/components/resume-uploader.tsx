"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

interface ResumeUploaderProps {
  onFileChange: (file: File | null) => void;
}

export default function ResumeUploader({ onFileChange }: ResumeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (!selectedFile) {
      setError(null);
      setFile(null);
      onFileChange(null);
      return;
    }

    // Check if file is PDF
    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      setFile(null);
      onFileChange(null);
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      setFile(null);
      onFileChange(null);
      return;
    }

    setError(null);
    setFile(selectedFile);
    onFileChange(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0] || null;

    if (!droppedFile) {
      return;
    }

    // Check if file is PDF
    if (droppedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    // Check file size (max 5MB)
    if (droppedFile.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return;
    }

    setError(null);
    setFile(droppedFile);
    onFileChange(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>

        {!file ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              error
                ? "border-red-400 bg-red-50"
                : "border-gray-300 hover:border-emerald-400"
            } transition-colors duration-200`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-3 bg-gray-100 rounded-full">
                <Upload className="h-8 w-8 text-gray-500" />
              </div>
              <div>
                <p className="text-lg font-medium">Drag and drop your resume</p>
                <p className="text-gray-500 text-sm mt-1">
                  or click to browse files
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  PDF format only, max 5MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Select File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
