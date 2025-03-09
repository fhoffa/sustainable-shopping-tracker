"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface VisualizeButtonProps {
  prompt: string
}

export function VisualizeButton({ prompt }: VisualizeButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleVisualize = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setIsOpen(true)  // Open dialog immediately to show loading state

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
      })

      const data = await response.json()
      console.log('📥 Image generation response:', data)

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.image_url) {
        throw new Error('No image URL in response')
      }

      setImageUrl(data.image_url)
    } catch (error) {
      console.error('❌ Error generating image:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleVisualize}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Eye className="mr-2 h-4 w-4" />
            Visualize
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Visualization</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p className="text-sm text-muted-foreground">Generating image...</p>
              </div>
            )}
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            {imageUrl && !isLoading && (
              <>
                <img 
                  src={imageUrl} 
                  alt="Generated visualization" 
                  className="rounded-lg w-full"
                />
                <p className="mt-2 text-sm text-muted-foreground">{prompt}</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 