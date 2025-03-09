"use server"

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

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
      Generate a detailed sustainable shopping report based on the following information:
      
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
      4. Recommendations for more sustainable shopping in the future
      
      IMPORTANT: Return ONLY a JSON object with no markdown formatting, code blocks, or backticks. The response should be a valid JSON object with the following structure:
      {
        "summary": "Brief overview of the shopping session",
        "sustainabilityScore": 85,
        "itemAnalysis": [
          { "item": "Item name from the list", "analysis": "Sustainability analysis" }
        ],
        "recommendations": [
          "Recommendation 1",
          "Recommendation 2"
        ]
      }
    `

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
    let reportData
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
            "Consider buying local produce when possible",
            "Reduce packaging waste by buying in bulk",
            "Look for sustainable alternatives to common items",
          ],
        }
      }
    }

    // Add timestamp to the report
    return {
      ...reportData,
      timestamp: new Date().toISOString(),
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

