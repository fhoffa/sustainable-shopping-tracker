import { NextRequest, NextResponse } from "next/server";

async function waitForImage(taskId: string, apiKey: string): Promise<string> {
  const maxAttempts = 10;
  const delayMs = 2000;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`https://api.freepik.com/v1/ai/tasks/${taskId}`, {
      headers: {
        'x-freepik-api-key': apiKey,
      }
    });
    
    const data = await response.json();
    console.log(`🔄 Check attempt ${attempt + 1}:`, data);

    if (data.status === 'completed' && data.result?.images?.[0]) {
      return data.result.images[0].url;
    }

    if (data.status === 'failed') {
      throw new Error('Image generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error('Timeout waiting for image generation');
}

function extractRecipeFromPrompt(prompt: string): string {
  // Remove price information
  prompt = prompt.replace(/\$\d+(?:\.\d{2})?(?:-\d+(?:\.\d{2})?)?/g, '');
  
  // Remove quantity information
  prompt = prompt.replace(/\d+-\d+|\d+(?:\.\d+)?\s*(?:pounds?|lbs?|oz|ounces?|kg|kilograms?)/gi, '');
  
  // Remove serving information
  prompt = prompt.replace(/(?:serves?|serving)\s+\d+/gi, '');
  
  // Remove nutritional and health information
  prompt = prompt.replace(/(?:contains|provides|healthy|nutritious|keto-friendly|low-carb|high-protein).*?(?:vitamin|protein|nutrients?|lycopene|antioxidants?|minerals?|healthy|nutritious)/gi, '');
  
  // Remove cost estimates
  prompt = prompt.replace(/estimated cost:.*$/i, '');
  
  // Remove diet-related prefixes
  prompt = prompt.replace(/(?:keto|paleo|vegan|vegetarian|gluten-free|dairy-free|low-carb|healthy)-(?:friendly|style|based)?\s*/gi, '');
  
  // Clean up any double spaces and trim
  prompt = prompt.replace(/\s+/g, ' ').trim();
  
  // Add "food photography of" to the beginning for better image generation
  return `food photography of ${prompt}`;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt: originalPrompt } = await req.json();
    const prompt = `food photography of ${originalPrompt.dish_description || originalPrompt}`;
    console.log("🎨 Original prompt:", originalPrompt);
    console.log("🎨 Simplified prompt for image:", prompt);

    const apiKey = process.env.NEXT_PUBLIC_FREEPIK_API_KEY!;
    
    const createResponse = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
      method: 'POST',
      headers: {
        'x-freepik-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: "b&w, earth, cartoon, ugly, text, watermark",
        guidance_scale: 2,
        seed: Math.floor(Math.random() * 1000),
        num_images: 1,
        image: {
          size: "square_1_1"
        },
        styling: {
          style: "photo",
          color: "vibrant",
          lightning: "studio",
          framing: "close-up"
        }
      })
    });

    const taskData = await createResponse.json();
    console.log("🖼️ Initial API response received");

    if (!taskData.data?.[0]?.base64) {
      console.error("❌ No image data in response:", taskData);
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
    
    const image_url = `data:image/jpeg;base64,${taskData.data[0].base64}`;
    return NextResponse.json({ image_url });
  } catch (error) {
    console.error('❌ Error generating image:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    }, { status: 500 });
  }
} 