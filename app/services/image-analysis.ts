import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function analyzeWithGroq(imageBase64: string) {
  try {
    console.log("🔍 Analyzing image with GROQ...");

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this produce image. Provide a JSON response with these fields: item (the produce name), quality (good/fair/poor), and price (if visible, otherwise null). Example: {\"item\": \"Red Apples\", \"quality\": \"good\", \"price\": \"$2.99/lb\"}"
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      model: "llama-3.2-11b-vision-preview",
      temperature: 0.3,
      max_tokens: 150,
      top_p: 1,
      stream: false
    });

    const analysis = chatCompletion.choices[0].message.content;
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(analysis);
      return {
        item: parsed.item || "Unknown item",
        quality: parsed.quality || null,
        price: parsed.price || null
      };
    } catch {
      // If not valid JSON, return structured data
      return {
        item: analysis,
        quality: null,
        price: null
      };
    }
  } catch (error) {
    console.error("❌ Error analyzing image with GROQ:", error);
    throw error;
  }
}
