"use client";

import type React from "react";
import { useState, useRef } from "react";
import { PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const resizeImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 512;
        const MAX_HEIGHT = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedImage = canvas.toDataURL("image/jpeg", 0.7);
        resolve(resizedImage);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface ProduceAnalysis {
  item: string;
  quality: 'good' | 'fair' | 'poor' | null;
  price: string | null;
}

export function ImageUpload({ onImageUpload }: { onImageUpload: (imageSrc: string, label: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProduceAnalysis | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  const generateImageDescription = async (imageBase64: string) => {
    try {
      setIsGeneratingDescription(true);
      const response = await fetch("/api/describe-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) throw new Error("Failed to generate description");

      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const resizedImageData = await resizeImage(file);
        setTempImage(resizedImageData);
        await generateImageDescription(resizedImageData);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }
  };

  return (
    <div onClick={handleClick} className="aspect-square rounded-md border border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors p-4">
      {!tempImage ? (
        <div className="flex flex-col items-center gap-1">
          <PlusCircle className="h-8 w-8 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Add</span>
        </div>
      ) : (
        <>
          <img src={tempImage} alt="Uploaded produce" className="w-full h-48 object-cover rounded-md mb-4" />
          {analysis && (
            <div className="w-full space-y-2">
              <p><strong>Item:</strong> {analysis.item}</p>
              {analysis.quality && <p><strong>Quality:</strong> {analysis.quality}</p>}
              {analysis.price && <p><strong>Price:</strong> {analysis.price}</p>}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (tempImage && analysis.item) {
                    onImageUpload(tempImage, analysis.item);
                    setTempImage(null);
                    setAnalysis(null);
                  }
                }}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md"
                disabled={isGeneratingDescription}
              >
                {isGeneratingDescription ? "Analyzing..." : "Add Item"}
              </button>
            </div>
          )}
        </>
      )}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
}
