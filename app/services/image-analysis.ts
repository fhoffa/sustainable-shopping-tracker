import { Groq } from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function analyzeWithGroq(imageBase64: string) {
  try {
    console.log("🔍 Analyzing image with GROQ...");

    const prompt = {
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image with produce and food items from the farmers market. Provide a JSON response with these fields: item (the produce name), quality (excellent/good/fair/poor), and price (if visible, otherwise null). Example: {\"item\": \"Red Apples\", \"quality\": \"good\", \"price\": \"$2.99/lb\"}"
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
    };

    console.log("📤 Sending prompt to GROQ:", {
      ...prompt,
      messages: prompt.messages.map(msg => ({
        ...msg,
        content: msg.content.map(c => 
          c.type === 'image_url' ? { ...c, image_url: { url: 'BASE64_IMAGE_DATA' }} : c
        )
      }))
    });

    const chatCompletion = await groq.chat.completions.create(prompt);

    const analysis = chatCompletion.choices[0].message.content;
    console.log("📥 Received response from GROQ:", analysis);
    
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
