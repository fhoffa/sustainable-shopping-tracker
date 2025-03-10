"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

interface ReportData {
  summary: string;
  sustainabilityScore: number;
  itemAnalysis: { item: string; analysis: string }[];
  recommendations: {
    instruction: string;  // Full buying instruction
    recipe: string;      // Just the recipe name for visualization
  }[];
  timestamp: string;
}

export async function generateShoppingReport(
  itemLabels: string[],
  profileData: {
    people: string
    diet: string
    budget: string
  },
) {
  try {
    // System prompt to guide the model
    const systemPrompt = `
      You are a sustainable shopping assistant that analyzes shopping sessions and provides detailed reports.
      You always respond with valid JSON objects without any markdown formatting.
      Your reports are concise, informative, and focused on sustainability.
      Analyze the actual items the user has in their shopping cart, not generic items.
    `

    // Create a prompt that includes the profile data and item labels
    const prompt = `
      Generate a detailed sustainable shopping list based on the following information:
      
      Shopping Profile:
      - Shopping for ${profileData.people} people
      - Diet preference: ${profileData.diet}
      - Budget type: ${profileData.budget}
      
      Shopping Items:
      ${
        itemLabels.length > 0
          ? itemLabels.map((label, index) => `${index + 1}. ${label}`).join("\n")
          : "No items have been added to this shopping session yet."
      }
      
      Please provide a comprehensive report that includes:
      1. A brief summary of the shopping choices based on the ACTUAL items listed above
      2. A sustainability score (0-100)
      3. Analysis of each specific item listed above (not generic items)
      4. Recommendation with a selection of items, quantities, and total estimated cost the user should buy to cook for the configure numberd of people and preferences. Include a recipe idea, and highlight the nutritional values. Make sure to include the ingredients that should be purchesed. For example 'Great day at the farmer market. Buy 2 lettuce heads and 1 pound of cilantro and one baguette and 3 eggs to make a delicious lettuce salad with side omelette. This will feed 2 people with protein and fiber.'
      
      IMPORTANT: Return ONLY a JSON object with no markdown formatting, code blocks, or backticks. The response should be a valid JSON object with the following structure:
      {
        "summary": "Brief overview of the shopping session",
        "sustainabilityScore": 85,
        "itemAnalysis": [
          { "item": "Item name from the list", "analysis": "Sustainability analysis" }
        ],
        "recommendations": [
          {
            "instruction": "Buy 1 pint of cucumbers ($3.00) and use them to make a refreshing cucumber salad. This will feed 2 people and provide a sustainable source of water and fiber.",
            "recipe": "cucumber salad with fresh dill and sour cream"
          }
        ]
      }
    `

    console.log(prompt);
    // Call Groq API using the AI SDK
    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"), // Using Llama 3.1 8B model for fast responses
      system: systemPrompt,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Clean the response text by removing any markdown code block delimiters
    let cleanedText = text

    // Remove markdown code block syntax if present
    if (cleanedText.includes("```")) {
      cleanedText = cleanedText.replace(/```json\s*/g, "")
      cleanedText = cleanedText.replace(/```\s*/g, "")
    }

    // Trim whitespace
    cleanedText = cleanedText.trim()

    // Try to parse the JSON
    let reportData: ReportData
    try {
      reportData = JSON.parse(cleanedText)

      // Validate the required fields
      if (
        !reportData.summary ||
        !reportData.sustainabilityScore ||
        !Array.isArray(reportData.itemAnalysis) ||
        !Array.isArray(reportData.recommendations)
      ) {
        throw new Error("Missing required fields in response")
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Cleaned text that failed to parse:", cleanedText)

      // Try to extract JSON from the response if it's embedded in text
      try {
        const jsonMatch = cleanedText.match(/{[\s\S]*}/)
        if (jsonMatch) {
          reportData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("No JSON object found in response")
        }
      } catch (extractError) {
        // Fallback to a default report structure with the actual items
        reportData = {
          summary: `We analyzed your shopping session with ${itemLabels.join(", ")} based on your ${profileData.diet} diet profile.`,
          sustainabilityScore: 75,
          itemAnalysis: itemLabels.map((label) => ({
            item: label,
            analysis: `This item is commonly found in ${profileData.diet} diets. Consider local and organic options when available.`,
          })),
          recommendations: [
            {
              instruction: "Consider buying local produce when possible",
              recipe: ""
            },
            {
              instruction: "Reduce packaging waste by buying in bulk",
              recipe: ""
            },
            {
              instruction: "Look for sustainable alternatives to common items",
              recipe: ""
            },
          ],
          timestamp: new Date().toISOString()
        }
      }
    }

    // Add timestamp to the report
    return {
      ...reportData,
      success: true,
    }
  } catch (error) {
    console.error("Error generating report:", error)
    return {
      success: false,
      error: "Failed to generate report. Please try again.",
    }
  }
}

