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

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    console.log("🎨 Generating image for prompt:", prompt);

    const apiKey = process.env.NEXT_PUBLIC_FREEPIK_API_KEY!;
    
    const createResponse = await fetch('https://api.freepik.com/v1/ai/text-to-image', {
      method: 'POST',
      headers: {
        'x-freepik-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        negative_prompt: "b&w, earth, cartoon, ugly",
        guidance_scale: 2,
        seed: Math.floor(Math.random() * 1000),
        num_images: 1,
        image: {
          size: "square_1_1"
        },
        styling: {
          style: "anime",
          color: "pastel",
          lightning: "warm",
          framing: "portrait"
        }
      })
    });

    const taskData = await createResponse.json();
    console.log("🖼️ Initial API response received");

    if (!taskData.data?.[0]?.base64) {
      console.error("❌ No image data in response:", taskData);
      return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
    }
    
    // Convert the base64 data to a data URL
    const image_url = `data:image/jpeg;base64,${taskData.data[0].base64}`;
    return NextResponse.json({ image_url });
  } catch (error) {
    console.error('❌ Error generating image:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to generate image' 
    }, { status: 500 });
  }
} 