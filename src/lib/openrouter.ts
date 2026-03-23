import OpenAI from "openai";

// Initialize OpenAI client pointing to Perplexity's API
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export interface ToolRecommendation {
  name: string;
  reason: string;
  quality_note: string;
  url: string;
}

export interface OpenRouterResponse {
  recommendations: ToolRecommendation[];
}

export async function getToolRecommendations(useCase: string): Promise<OpenRouterResponse> {
  try {
    const response = await openrouter.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI tool recommendation expert.
Given a user's use case, return the top 3 AI tools that best accomplish it.
For each tool return: name, why it's the best fit, output quality note, and official URL.
Be concise. Format as JSON array: [{"name": "Tool Name", "reason": "Why it's best", "quality_note": "Quality detail", "url": "https://url.com"}]
Base your answer on current, real-world tool capabilities.`,
        },
        {
          role: "user",
          content: useCase,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from OpenRouter API");
    }

    // Attempt to parse the JSON array from the response string
    // The response might include markdown code block formatting
    let jsonStr = content;
    const jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const recommendations: ToolRecommendation[] = JSON.parse(jsonStr);

    return {
      recommendations,
    };
  } catch (error) {
    console.error("Error fetching recommendations from OpenRouter:", error);
    throw error;
  }
}
