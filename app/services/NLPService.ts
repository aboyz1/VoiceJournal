import { Mood } from "../data/schemas";
import {
  analyzeTextPatterns,
  ComprehensiveMoodAnalysis,
  EmotionAnalysis,
  generateEmotionalSummary,
  getEmotionalKeywords,
  getEmotionIntensity,
} from "../utils/moodUtils";

import { generateUniqueInsights } from "./InsightGenerationService";

const HF_TOKEN = "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";

export interface MoodAnalysis {
  mood: Mood;
  confidence: number;
}

export interface TextAnalysisContext {
  originalText: string;
  sentences: string[];
  emotionalKeywords: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  textPatterns: {
    hasContrasts: boolean;
    hasProgression: boolean;
    hasQuestions: boolean;
    hasExclamations: boolean;
    tenseUsed: "past" | "present" | "future" | "mixed";
    personalPronouns: string[];
    topics: string[];
    emotionalTriggers: string[];
  };
  sentenceEmotions: Array<{
    sentence: string;
    emotions: MoodAnalysis[];
    dominantEmotion: Mood;
  }>;
}

// Enhanced mapping with better emotion detection
const mapHuggingFaceToMood = (label: string): Mood => {
  const moodMap: Record<string, Mood> = {
    joy: "happy",
    happiness: "happy",
    sadness: "sad",
    anger: "angry",
    fear: "sad",
    surprise: "excited",
    disgust: "angry",
    neutral: "neutral",
    love: "happy",
    optimism: "excited",
    pessimism: "sad",
    admiration: "happy",
    approval: "happy",
    caring: "happy",
    desire: "excited",
    excitement: "excited",
    gratitude: "happy",
    pride: "happy",
    relief: "calm",
    annoyance: "angry",
    disappointment: "sad",
    disapproval: "angry",
    embarrassment: "sad",
    grief: "sad",
    nervousness: "sad",
    remorse: "sad",
    confusion: "neutral",
    curiosity: "neutral",
    realization: "neutral",
  };

  return moodMap[label.toLowerCase()] || "neutral";
};

// Helper function to get relevant keywords for each emotion
const getRelevantKeywords = (
  mood: Mood,
  keywords: { positive: string[]; negative: string[]; neutral: string[] }
): string[] => {
  switch (mood) {
    case "happy":
    case "excited":
    case "calm":
      return keywords.positive;
    case "sad":
    case "angry":
      return keywords.negative;
    case "neutral":
    default:
      return keywords.neutral;
  }
};

// Analyze with multiple models
const analyzeWithMultipleModels = async (
  text: string
): Promise<MoodAnalysis[]> => {
  const models = [
    "j-hartmann/emotion-english-distilroberta-base",
    "bhadresh-savani/distilbert-base-uncased-emotion",
  ];

  const results: MoodAnalysis[] = [];

  for (const model of models) {
    try {
      console.log(`[NLP] Analyzing with model: ${model}`);

      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: text }),
        }
      );

      if (!response.ok) {
        console.warn(
          `[NLP] Model ${model} failed with status ${response.status}`
        );
        continue;
      }

      const data = await response.json();

      if (data.error && data.error.includes("loading")) {
        console.warn(`[NLP] Model ${model} is loading, skipping...`);
        continue;
      }

      if (
        data &&
        Array.isArray(data) &&
        data.length > 0 &&
        Array.isArray(data[0])
      ) {
        const topEmotions = data[0].slice(0, 5);
        console.log(`[NLP] ${model} results:`, topEmotions);

        for (const emotion of topEmotions) {
          results.push({
            mood: mapHuggingFaceToMood(emotion.label),
            confidence: emotion.score,
          });
        }
        break;
      }
    } catch (error) {
      console.warn(`[NLP] Error with model ${model}:`, error);
      continue;
    }
  }

  return results;
};

// Build comprehensive text analysis context
const buildTextAnalysisContext = async (
  text: string
): Promise<TextAnalysisContext> => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const emotionalKeywords = getEmotionalKeywords(text);
  const textPatterns = analyzeTextPatterns(text);

  // Analyze each sentence for emotional progression
  const sentenceEmotions: Array<{
    sentence: string;
    emotions: MoodAnalysis[];
    dominantEmotion: Mood;
  }> = [];

  for (const sentence of sentences) {
    if (sentence.trim().length < 10) continue;

    try {
      const emotions = await analyzeWithMultipleModels(sentence.trim());
      const dominantEmotion =
        emotions.length > 0 ? emotions[0].mood : "neutral";

      sentenceEmotions.push({
        sentence: sentence.trim(),
        emotions,
        dominantEmotion,
      });
    } catch (error) {
      console.warn("[NLP] Error analyzing sentence:", sentence, error);
    }
  }

  return {
    originalText: text,
    sentences,
    emotionalKeywords,
    textPatterns,
    sentenceEmotions,
  };
};

// Comprehensive emotion analysis with context
export const analyzeEmotionsComprehensively = async (
  text: string
): Promise<ComprehensiveMoodAnalysis> => {
  try {
    console.log('[NLP] Starting comprehensive analysis for:', text);
    
    // Build comprehensive context
    const context = await buildTextAnalysisContext(text);
    
    // Get emotions analysis
    let allEmotions: MoodAnalysis[] = [];
    context.sentenceEmotions.forEach((sentenceData) => {
      allEmotions.push(...sentenceData.emotions);
    });

    if (allEmotions.length === 0) {
      allEmotions = await analyzeWithMultipleModels(text);
    }

    // Process emotions (same as before)
    const emotionGroups: Record<Mood, number[]> = {
      happy: [],
      sad: [],
      angry: [],
      neutral: [],
      excited: [],
      calm: [],
    };

    allEmotions.forEach((emotion) => {
      emotionGroups[emotion.mood].push(emotion.confidence);
    });

    const processedEmotions: EmotionAnalysis[] = [];

    Object.entries(emotionGroups).forEach(([mood, confidences]) => {
      if (confidences.length > 0) {
        const avgConfidence =
          confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
        const relevantKeywords = getRelevantKeywords(
          mood as Mood,
          context.emotionalKeywords
        );

        processedEmotions.push({
          emotion: mood as Mood,
          confidence: avgConfidence,
          intensity: getEmotionIntensity(avgConfidence),
          keywords: relevantKeywords,
        });
      }
    });

    processedEmotions.sort((a, b) => b.confidence - a.confidence);

    const primaryEmotion = processedEmotions[0] || {
      emotion: "neutral" as Mood,
      confidence: 0.5,
      intensity: "medium" as const,
      keywords: [],
    };

    const secondaryEmotions = processedEmotions
      .slice(1, 3)
      .filter((e) => e.confidence > 0.2);

    // Determine overall sentiment (same logic as before)
    const positiveEmotions = processedEmotions.filter((e) =>
      ["happy", "excited", "calm"].includes(e.emotion)
    );
    const negativeEmotions = processedEmotions.filter((e) =>
      ["sad", "angry"].includes(e.emotion)
    );

    let overallSentiment: "positive" | "negative" | "neutral" | "mixed" =
      "neutral";

    if (positiveEmotions.length > 0 && negativeEmotions.length > 0) {
      const posSum = positiveEmotions.reduce((sum, e) => sum + e.confidence, 0);
      const negSum = negativeEmotions.reduce((sum, e) => sum + e.confidence, 0);
      overallSentiment =
        Math.abs(posSum - negSum) < 0.2
          ? "mixed"
          : posSum > negSum
          ? "positive"
          : "negative";
    } else if (positiveEmotions.length > negativeEmotions.length) {
      overallSentiment = "positive";
    } else if (negativeEmotions.length > positiveEmotions.length) {
      overallSentiment = "negative";
    }

    const emotionalComplexity =
      secondaryEmotions.length === 0
        ? "simple"
        : secondaryEmotions.length === 1
        ? "moderate"
        : "complex";

    // Replace the insights generation with truly dynamic AI-generated insights
    const dynamicInsights = await generateUniqueInsights(
      text,
      primaryEmotion.emotion,
      primaryEmotion.confidence
    );

    const analysis: ComprehensiveMoodAnalysis = {
      primaryEmotion,
      secondaryEmotions,
      overallSentiment,
      emotionalComplexity,
      summary: generateEmotionalSummary({
        primaryEmotion,
        secondaryEmotions,
        overallSentiment,
        emotionalComplexity,
        summary: "",
        insights: [],
      }),
      insights: dynamicInsights, // Truly unique AI-generated insights
      context,
    };

    console.log("[NLP] Comprehensive analysis complete:", analysis);
    return analysis;
  } catch (error) {
    console.error("[NLP Comprehensive Error]:", error);

    return {
      primaryEmotion: {
        emotion: "neutral",
        confidence: 0.5,
        intensity: "medium",
        keywords: [],
      },
      secondaryEmotions: [],
      overallSentiment: "neutral",
      emotionalComplexity: "simple",
      summary: "Unable to analyze emotions at this time.",
      insights: [
        "Your emotional expression shows self-awareness, which is important for mental well-being.",
      ],
    };
  }
};

// Enhanced text analysis with sentence-level processing
export const analyzeText = async (text: string): Promise<MoodAnalysis> => {
  try {
    const comprehensiveAnalysis = await analyzeEmotionsComprehensively(text);
    return {
      mood: comprehensiveAnalysis.primaryEmotion.emotion,
      confidence: comprehensiveAnalysis.primaryEmotion.confidence,
    };
  } catch (error) {
    console.error("[NLP Error]:", error);
    return { mood: "neutral", confidence: 0 };
  }
};

// Legacy function for backward compatibility
export const analyzeMood = async (text: string): Promise<string> => {
  try {
    const analysis = await analyzeText(text);
    return analysis.mood;
  } catch (error) {
    console.error("[NLP Error]:", error);
    return "neutral";
  }
};

/**
 * Generate truly dynamic insights using AI-based text analysis
 */
const generateDynamicInsights = async (
  text: string,
  primaryEmotion: Mood,
  confidence: number,
  emotionalKeywords: any,
  textPatterns: any
): Promise<string[]> => {
  try {
    // Create a comprehensive emotional profile
    const emotionalProfile = {
      text: text,
      primaryEmotion: primaryEmotion,
      confidence: confidence,
      wordCount: text.split(" ").length,
      sentenceCount: text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
        .length,
      positiveWords: emotionalKeywords.positive,
      negativeWords: emotionalKeywords.negative,
      hasQuestions: text.includes("?"),
      hasExclamations: text.includes("!"),
      personalPronouns: textPatterns.personalPronouns || [],
      topics: textPatterns.topics || [],
      tenseUsed: textPatterns.tenseUsed || "mixed",
    };

    // Generate insights using Hugging Face text generation
    const insights = await generateInsightsWithAI(emotionalProfile);
    return insights;
  } catch (error) {
    console.error("[Dynamic Insights Error]:", error);
    // Fallback to a single contextual insight
    return [generateContextualFallback(text, primaryEmotion)];
  }
};

/**
 * Use AI to generate unique insights based on emotional profile
 */
const generateInsightsWithAI = async (profile: any): Promise<string[]> => {
  const insights: string[] = [];

  // Generate 3-4 different types of insights using AI
  const insightPrompts = [
    createEmotionalValidationPrompt(profile),
    createCopingStrategyPrompt(profile),
    createPerspectivePrompt(profile),
    createActionOrientedPrompt(profile),
  ];

  for (const prompt of insightPrompts) {
    try {
      const insight = await generateTextWithHuggingFace(prompt);
      if (insight && insight.length > 20 && insight.length < 200) {
        insights.push(insight);
      }
    } catch (error) {
      console.warn("[AI Insight Generation]:", error);
    }
  }

  // If AI generation fails, create dynamic insights based on content analysis
  if (insights.length === 0) {
    return generateContentBasedInsights(profile);
  }

  return insights.slice(0, 4); // Return up to 4 insights
};

/**
 * Generate text using Hugging Face API
 */
const generateTextWithHuggingFace = async (prompt: string): Promise<string> => {
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
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`AI generation failed: ${response.status}`);
  }

  const data = await response.json();

  // Extract generated text
  if (data && data[0] && data[0].generated_text) {
    const generatedText = data[0].generated_text.replace(prompt, "").trim();
    return cleanGeneratedInsight(generatedText);
  }

  throw new Error("No generated text received");
};

/**
 * Create prompts for different types of insights
 */
const createEmotionalValidationPrompt = (profile: any): string => {
  return `A person wrote: "${profile.text.substring(
    0,
    100
  )}..." and is feeling ${
    profile.primaryEmotion
  }. Provide a validating insight about their emotional experience:`;
};

const createCopingStrategyPrompt = (profile: any): string => {
  const context =
    profile.topics.length > 0 ? ` about ${profile.topics[0]}` : "";
  return `Someone is feeling ${profile.primaryEmotion}${context}. Suggest a helpful coping strategy or perspective:`;
};

const createPerspectivePrompt = (profile: any): string => {
  const timeContext =
    profile.tenseUsed === "past"
      ? "reflecting on past events"
      : profile.tenseUsed === "future"
      ? "thinking about the future"
      : "focused on the present";
  return `A person is ${timeContext} and feeling ${profile.primaryEmotion}. Offer a reframing perspective:`;
};

const createActionOrientedPrompt = (profile: any): string => {
  return `Someone expressed ${profile.primaryEmotion} feelings. Suggest a constructive next step or action they could consider:`;
};

/**
 * Clean and format AI-generated insights
 */
const cleanGeneratedInsight = (text: string): string => {
  // Remove unwanted characters and format properly
  let cleaned = text
    .replace(/[<>]/g, "")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Ensure it starts with capital letter
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // Ensure it ends with proper punctuation
  if (cleaned.length > 0 && !cleaned.match(/[.!?]$/)) {
    cleaned += ".";
  }

  return cleaned;
};

/**
 * Fallback: Generate content-based insights when AI fails
 */
const generateContentBasedInsights = (profile: any): string[] => {
  const insights: string[] = [];

  // Analyze the actual content dynamically
  const textLower = profile.text.toLowerCase();

  // Extract specific phrases and create insights around them
  const keyPhrases = extractKeyPhrases(profile.text);

  keyPhrases.forEach((phrase) => {
    if (phrase.type === "concern") {
      insights.push(
        `Your concern about "${phrase.content}" reflects how much this matters to you. This awareness is the first step toward addressing it.`
      );
    } else if (phrase.type === "achievement") {
      insights.push(
        `Mentioning "${phrase.content}" shows recognition of your efforts. Acknowledging these moments helps build confidence.`
      );
    } else if (phrase.type === "relationship") {
      insights.push(
        `Your reference to "${phrase.content}" indicates how relationships influence your emotional state. These connections are significant to your well-being.`
      );
    }
  });

  // Analyze emotional intensity based on word choice
  const intensityWords =
    profile.text.match(
      /\b(very|extremely|really|so|incredibly|absolutely|completely|totally)\s+\w+/gi
    ) || [];
  if (intensityWords.length > 0) {
    const exampleIntensity = intensityWords[0];
    insights.push(
      `Your use of phrases like "${exampleIntensity}" shows the depth of your emotional experience. These intense feelings deserve acknowledgment and care.`
    );
  }

  // Analyze questions in the text
  const questions = profile.text.match(/[^.!?]*\?/g) || [];
  if (questions.length > 0) {
    const firstQuestion = questions[0].trim();
    insights.push(
      `Your question "${firstQuestion}" shows you're actively seeking understanding. This curiosity about your situation is a strength.`
    );
  }

  // Analyze specific emotional words used
  const emotionalWords = [...profile.positiveWords, ...profile.negativeWords];
  if (emotionalWords.length > 0) {
    const uniqueWords = [...new Set(emotionalWords)].slice(0, 2);
    insights.push(
      `Your choice of words like "${uniqueWords.join(
        '" and "'
      )}" reveals the nuanced nature of your emotional experience.`
    );
  }

  return insights.filter((insight) => insight.length > 0).slice(0, 3);
};

/**
 * Extract key phrases from text for dynamic analysis
 */
const extractKeyPhrases = (
  text: string
): Array<{ type: string; content: string }> => {
  const phrases: Array<{ type: string; content: string }> = [];

  // Extract concerns (I'm worried about, I'm stressed about, etc.)
  const concernMatches = text.match(
    /(?:worried about|stressed about|anxious about|concerned about)\s+([^.!?]+)/gi
  );
  if (concernMatches) {
    concernMatches.forEach((match) => {
      const content = match.replace(
        /^(worried about|stressed about|anxious about|concerned about)\s+/i,
        ""
      );
      phrases.push({ type: "concern", content: content.trim() });
    });
  }

  // Extract achievements (I accomplished, I finished, I succeeded, etc.)
  const achievementMatches = text.match(
    /(?:accomplished|finished|succeeded|completed|achieved|won)\s+([^.!?]+)/gi
  );
  if (achievementMatches) {
    achievementMatches.forEach((match) => {
      phrases.push({ type: "achievement", content: match.trim() });
    });
  }

  // Extract relationship references
  const relationshipMatches = text.match(
    /(?:my|with my|talked to my)\s+(friend|family|partner|mom|dad|sister|brother|boyfriend|girlfriend|husband|wife)[^.!?]*/gi
  );
  if (relationshipMatches) {
    relationshipMatches.forEach((match) => {
      phrases.push({ type: "relationship", content: match.trim() });
    });
  }

  return phrases;
};

/**
 * Generate contextual fallback when all else fails
 */
const generateContextualFallback = (text: string, emotion: Mood): string => {
  const wordCount = text.split(" ").length;
  const hasFirstPerson = /\b(i|me|my|myself)\b/i.test(text);

  if (wordCount > 50 && hasFirstPerson) {
    return `Your ${wordCount}-word reflection shows deep self-awareness about your ${emotion} feelings. This level of introspection is valuable for emotional growth.`;
  } else if (text.includes("?")) {
    return `The questions in your writing show you're actively seeking understanding about your ${emotion} experience. This curiosity is a sign of emotional intelligence.`;
  } else {
    return `Your expression of ${emotion} feelings through writing demonstrates emotional courage and self-awareness.`;
  }
};
