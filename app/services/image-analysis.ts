import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function analyzeWithGroq(imageBase64: string) {
  try {
    console.log("🔍 Analyzing image with GROQ...");

    const messages = [
      {
        role: "user" as const,
        content: [
          {
            type: "text" as const,
            text: "Analyze this image with produce and food items from the farmers market. Provide a JSON response with these fields: item (the produce name), quality (excellent/good/fair/poor), price (if visible, otherwise null), and dish_description (a simple description of the dish without quantities, nutritional info, or prices). Example: {\"item\": \"Red Apples\", \"quality\": \"good\", \"price\": \"$2.99/lb\", \"dish_description\": \"apple pie with cinnamon and vanilla\"}"
          },
          {
            type: "image_url" as const,
            image_url: {
              url: imageBase64
            }
          }
        ]
      }
    ];

    // Log the prompt (without the full base64 image data)
    console.log("📤 Sending prompt to GROQ:", {
      messages: messages.map(msg => ({
        ...msg,
        content: msg.content.map(c => 
          c.type === 'image_url' ? { ...c, image_url: { url: '[BASE64_IMAGE_DATA]' }} : c
        )
      })),
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.3,
      max_tokens: 150
    });

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.3,
      max_tokens: 150
    });

    if (!chatCompletion.choices[0].message.content) {
      throw new Error("No content in response");
    }

    const analysis = chatCompletion.choices[0].message.content;
    console.log("📥 Received response from GROQ:", analysis);
    
    try {
      const parsed = JSON.parse(analysis);
      return {
        item: parsed.item || "Unknown item",
        quality: parsed.quality || null,
        price: parsed.price || null,
        dish_description: parsed.dish_description || null
      };
    } catch {
      return {
        item: analysis,
        quality: null,
        price: null,
        dish_description: null
      };
    }
  } catch (error) {
    console.error("❌ Error analyzing image with GROQ:", error);
    throw error;
  }
}
