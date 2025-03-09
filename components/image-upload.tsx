"use client"

import type React from "react"

import { useState, useRef } from "react"
import { PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ImageUploadProps {
  onImageUpload: (imageSrc: string, label: string) => void
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tempImage, setTempImage] = useState<string | null>(null)
  const [label, setLabel] = useState("")

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tempImage && label.trim()) {
      onImageUpload(tempImage, label.trim())
      setTempImage(null)
      setLabel("")
    }
  }

  if (tempImage) {
    return (
      <div className="aspect-square rounded-md border p-3 flex flex-col justify-between">
        <div className="relative aspect-square rounded-md overflow-hidden mb-2">
          <img src={tempImage || "/placeholder.svg"} alt="Preview" className="object-cover w-full h-full" />
        </div>
        <form onSubmit={handleLabelSubmit} className="space-y-2">
          <div>
            <Label htmlFor="item-label">What is this item?</Label>
            <Input
              id="item-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Strawberries"
              className="w-full"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-1 px-3 rounded-md text-sm"
          >
            Add Item
          </button>
        </form>
      </div>
    )
  }

  return (
    <div
      onClick={handleClick}
      className="aspect-square rounded-md border border-dashed flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <div className="flex flex-col items-center gap-1">
        <PlusCircle className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Add</span>
      </div>
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  )
}

