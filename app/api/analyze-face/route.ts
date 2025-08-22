// It handles POST requests containing an image, analyzes it using the Gemini API,
// and returns a humorous "elevated" score and analysis.

import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Initialize the Gemini client with the API key from environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" })

/**
 * Handles the POST request to analyze a face image.
 *
 * @param request The incoming Next.js request.
 * @returns A NextResponse object with the analysis result or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Remove data URL prefix if present to get the raw Base64 string.
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "")

    // The prompt is the instructions for the AI model.
    const prompt = `You are a fun AI that analyzes faces to determine if someone appears to be "elevated" or in a cannabis-influenced state. This is purely for entertainment purposes.

Analyze this face image and provide:
1. A probability score from 0-100 (where 100 means definitely looks elevated/cannabis-influenced, 0 means completely sober)
2. A humorous but respectful explanation of your assessment using cannabis culture language

Look for typical signs like:
- Red or droopy eyes
- Relaxed facial expression
- Sleepy or "stoned" appearance
- Dilated pupils
- General "spaced out" or blissful look
- Mellow vibes

Be playful and use cannabis culture terms like "elevated," "vibing," "chilled out," "in the clouds," etc. Keep it fun and lighthearted!

Respond in this exact JSON format:
{
  "score": [number between 0-100],
  "analysis": "[your humorous cannabis-themed analysis in 2-3 sentences]"
}

If you can't see a face clearly enough to analyze, mention that and return -1. If there are multiple faces analyze all of them and in the output describe which is which.
`

    // Construct the payload with text and image parts for the multimodal model.
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg", // or image/png depending on your image type
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        // Set the temperature for creative and playful responses.
        temperature: 0.7,
      },
    }

    // Make the API call to the Gemini model.
    const result = await model.generateContent(payload)

    // The response structure is a bit different from Groq.
    // The generated text is found in the candidates array.
    const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text

    if (!responseText) {
      return NextResponse.json({ error: "Gemini API did not return a valid response." }, { status: 500 })
    }

    // Parse the JSON response from the model.
    let parsedResult
    try {
      parsedResult = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Gemini JSON:", parseError)
      // If JSON parsing fails, create a fallback response.
      const score = Math.floor(Math.random() * 100)
      parsedResult = {
        score,
        analysis:
          "The AI had trouble analyzing this image, but based on the vibes, I'd say you're looking pretty chill! 😎",
      }
    }

    // Ensure the score is within the specified bounds.
    parsedResult.score = Math.max(0, Math.min(100, parsedResult.score))

    return NextResponse.json(parsedResult)
  } catch (error) {
    console.error("Error analyzing face:", error)
    return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
  }
}
