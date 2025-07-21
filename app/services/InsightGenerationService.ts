/**
 * Advanced AI-powered insight generation service with robust fallbacks
 */

import HF_TOKEN from "react-native-config";

interface InsightGenerationContext {
  originalText: string;
  primaryEmotion: string;
  confidence: number;
  keyPhrases: string[];
  emotionalIntensity: string;
  textLength: number;
  personalContext: string[];
}

/**
 * Generate completely unique insights with guaranteed results
 */
export const generateUniqueInsights = async (
  text: string,
  primaryEmotion: string,
  confidence: number
): Promise<string[]> => {
  console.log("[Insight Generation] Starting for emotion:", primaryEmotion);

  try {
    // Extract context from the actual text
    const context = extractInsightContext(text, primaryEmotion, confidence);
    console.log("[Insight Generation] Context extracted:", context);

    // Try AI generation first
    const aiInsights = await tryAIGeneration(context);

    if (aiInsights.length > 0) {
      console.log(
        "[Insight Generation] AI insights generated:",
        aiInsights.length
      );
      return aiInsights;
    }

    // Fallback to content-based insights
    console.log("[Insight Generation] AI failed, using content-based fallback");
    const contentInsights = generateAdvancedContentInsights(context);

    if (contentInsights.length > 0) {
      return contentInsights;
    }

    // Final fallback - guaranteed insights
    console.log("[Insight Generation] Using guaranteed fallback");
    return generateGuaranteedInsights(context);
  } catch (error) {
    console.error("[Insight Generation Error]:", error);
    // Always return something
    return generateGuaranteedInsights({
      originalText: text,
      primaryEmotion,
      confidence,
      keyPhrases: [],
      emotionalIntensity: "medium",
      textLength: text.split(" ").length,
      personalContext: [],
    });
  }
};

/**
 * Try AI generation with multiple approaches
 */
const tryAIGeneration = async (
  context: InsightGenerationContext
): Promise<string[]> => {
  const insights: string[] = [];

  // Try different AI models/approaches
  const generators = [
    () => generateWithGPT2Simple(context),
    () => generateWithDialoGPT(context),
    () => generateWithT5(context),
  ];

  for (const generator of generators) {
    try {
      const result = await generator();
      if (result && result.length > 0) {
        insights.push(...result);
        if (insights.length >= 3) break; // We have enough
      }
    } catch (error) {
      console.warn("[AI Generation] Method failed:", error.message);
      continue;
    }
  }

  return insights.slice(0, 4);
};

/**
 * Simple GPT-2 generation with better prompts
 */
const generateWithGPT2Simple = async (
  context: InsightGenerationContext
): Promise<string[]> => {
  const insights: string[] = [];

  // Create simpler, more direct prompts
  const prompts = [
    `Someone is feeling ${context.primaryEmotion}. Give them supportive advice:`,
    `A person wrote "${context.originalText.substring(
      0,
      50
    )}..." How can they feel better?`,
    `What would you tell someone who is ${context.primaryEmotion} about their situation?`,
  ];

  for (const prompt of prompts) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/gpt2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              max_new_tokens: 50,
              temperature: 0.7,
              do_sample: true,
              top_p: 0.9,
              return_full_text: false,
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].generated_text) {
          const cleaned = cleanAndFormatInsight(data[0].generated_text);
          if (cleaned.length > 15) {
            insights.push(cleaned);
          }
        }
      }
    } catch (error) {
      console.warn("[GPT-2 Generation]:", error);
    }
  }

  return insights;
};

/**
 * Try DialoGPT for conversational insights
 */
const generateWithDialoGPT = async (
  context: InsightGenerationContext
): Promise<string[]> => {
  try {
    const prompt = `I'm feeling ${context.primaryEmotion}. Can you help?`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 100,
            temperature: 0.8,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].generated_text) {
        const cleaned = cleanAndFormatInsight(
          data[0].generated_text.replace(prompt, "")
        );
        if (cleaned.length > 15) {
          return [cleaned];
        }
      }
    }
  } catch (error) {
    console.warn("[DialoGPT Generation]:", error);
  }

  return [];
};

/**
 * Try T5 for text generation
 */
const generateWithT5 = async (
  context: InsightGenerationContext
): Promise<string[]> => {
  try {
    const prompt = `advice for someone feeling ${context.primaryEmotion}:`;

    const response = await fetch(
      "https://api-inference.huggingface.co/models/t5-base",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 80,
            temperature: 0.7,
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data[0] && data[0].generated_text) {
        const cleaned = cleanAndFormatInsight(data[0].generated_text);
        if (cleaned.length > 15) {
          return [cleaned];
        }
      }
    }
  } catch (error) {
    console.warn("[T5 Generation]:", error);
  }

  return [];
};

/**
 * Extract context with better error handling
 */
const extractInsightContext = (
  text: string,
  primaryEmotion: string,
  confidence: number
): InsightGenerationContext => {
  try {
    const lowerText = text.toLowerCase();

    // Extract key phrases safely
    const keyPhrases = extractMeaningfulPhrases(text);

    // Determine emotional intensity
    const intensityIndicators = [
      "very",
      "extremely",
      "really",
      "so",
      "incredibly",
      "absolutely",
      "completely",
      "totally",
      "utterly",
      "deeply",
      "profoundly",
    ];
    const intensityCount = intensityIndicators.filter((word) =>
      lowerText.includes(word)
    ).length;
    const emotionalIntensity =
      intensityCount > 2 ? "high" : intensityCount > 0 ? "medium" : "low";

    // Extract personal context
    const personalContext = extractPersonalContext(text);

    return {
      originalText: text,
      primaryEmotion,
      confidence,
      keyPhrases,
      emotionalIntensity,
      textLength: text.split(" ").length,
      personalContext,
    };
  } catch (error) {
    console.warn("[Context Extraction Error]:", error);
    // Return minimal context
    return {
      originalText: text,
      primaryEmotion,
      confidence,
      keyPhrases: [],
      emotionalIntensity: "medium",
      textLength: text.split(" ").length,
      personalContext: [],
    };
  }
};

/**
 * Extract meaningful phrases with error handling
 */
const extractMeaningfulPhrases = (text: string): string[] => {
  try {
    const phrases: string[] = [];

    // Simple pattern matching
    const patterns = [
      /(?:worried about|stressed about|anxious about|concerned about)\s+([^.!?]{5,30})/gi,
      /(?:excited about|happy about|proud of)\s+([^.!?]{5,30})/gi,
      /(?:struggling with|having trouble with)\s+([^.!?]{5,30})/gi,
    ];

    patterns.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const cleaned = match.trim();
          if (cleaned.length > 10 && cleaned.length < 50) {
            phrases.push(cleaned);
          }
        });
      }
    });

    return phrases.slice(0, 3);
  } catch (error) {
    console.warn("[Phrase Extraction Error]:", error);
    return [];
  }
};

/**
 * Extract personal context safely
 */
const extractPersonalContext = (text: string): string[] => {
  try {
    const context: string[] = [];
    const lowerText = text.toLowerCase();

    const domains = {
      academic: ["school", "exam", "test", "study", "homework", "class"],
      work: ["job", "work", "boss", "meeting", "project", "career"],
      relationships: ["friend", "family", "partner", "relationship"],
      health: ["sick", "tired", "doctor", "health"],
      personal: ["myself", "future", "goals", "dreams"],
    };

    Object.entries(domains).forEach(([domain, keywords]) => {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        context.push(domain);
      }
    });

    return context;
  } catch (error) {
    console.warn("[Personal Context Error]:", error);
    return [];
  }
};

/**
 * Advanced content-based insights as fallback
 */
const generateAdvancedContentInsights = (
  context: InsightGenerationContext
): string[] => {
  const insights: string[] = [];

  try {
    // Generate insights based on specific phrases
    if (context.keyPhrases.length > 0) {
      const phrase = context.keyPhrases[0];
      insights.push(
        `Your mention of "${phrase}" shows you're being specific about what's affecting you emotionally. This self-awareness is valuable for understanding your feelings.`
      );
    }

    // Generate insight based on emotional intensity
    if (context.emotionalIntensity === "high") {
      insights.push(
        `The intensity of your ${context.primaryEmotion} feelings comes through clearly in your writing. Strong emotions like this often signal that something important is happening in your life.`
      );
    }

    // Generate insight based on personal context
    if (context.personalContext.length > 0) {
      const contextArea = context.personalContext[0];
      insights.push(
        `Your ${context.primaryEmotion} feelings in the ${contextArea} area of your life are completely valid. Different life domains can significantly impact our emotional well-being.`
      );
    }

    // Generate insight based on text length
    if (context.textLength > 50) {
      insights.push(
        `Taking the time to express your thoughts in ${context.textLength} words shows you're actively processing your ${context.primaryEmotion} feelings. This kind of reflection is healthy and important.`
      );
    }
  } catch (error) {
    console.warn("[Content Insights Error]:", error);
  }

  return insights.filter((insight) => insight.length > 0);
};

/**
 * Guaranteed insights - always returns something
 */
const generateGuaranteedInsights = (
  context: InsightGenerationContext
): string[] => {
  const insights: string[] = [];

  // Basic emotional validation
  insights.push(
    `Your ${context.primaryEmotion} feelings are completely valid and deserve acknowledgment.`
  );

  // Encourage self-awareness
  insights.push(
    `Taking time to express and examine your emotions through writing shows emotional intelligence and self-care.`
  );

  // Context-based insight
  if (context.textLength > 30) {
    insights.push(
      `Your thoughtful expression of these feelings shows you're actively working to understand your emotional experience.`
    );
  } else {
    insights.push(
      `Even brief expressions of emotion are meaningful and worth exploring further.`
    );
  }

  // Encouraging forward movement
  insights.push(
    `Remember that emotions are temporary and provide valuable information about what matters to you.`
  );

  return insights;
};

/**
 * Clean and format insights with better error handling
 */
const cleanAndFormatInsight = (text: string): string => {
  try {
    if (!text || typeof text !== "string") {
      return "";
    }

    let cleaned = text
      .replace(/^(Response:|Suggestion:|Reflection:|Insight:)\s*/i, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/[<>{}[\]]/g, "")
      .trim();

    // Remove incomplete sentences at the end
    const sentences = cleaned.split(/[.!?]+/);
    if (
      sentences.length > 1 &&
      sentences[sentences.length - 1].trim().length < 10
    ) {
      sentences.pop();
      cleaned = sentences.join(". ") + ".";
    }

    // Ensure proper capitalization and punctuation
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
      if (!cleaned.match(/[.!?]$/)) {
        cleaned += ".";
      }
    }

    return cleaned;
  } catch (error) {
    console.warn("[Insight Cleaning Error]:", error);
    return text || "";
  }
};
