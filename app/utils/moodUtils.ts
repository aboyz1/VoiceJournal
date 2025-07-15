import { Mood } from "../data/schemas";

export interface MoodConfig {
  color: string;
  icon: string;
  description: string;
  displayName: string;
  intensity?: "low" | "medium" | "high";
}

export interface EmotionAnalysis {
  emotion: Mood;
  confidence: number;
  intensity: "low" | "medium" | "high";
  keywords: string[];
}

export interface ComprehensiveMoodAnalysis {
  primaryEmotion: EmotionAnalysis;
  secondaryEmotions: EmotionAnalysis[];
  overallSentiment: "positive" | "negative" | "neutral" | "mixed";
  emotionalComplexity: "simple" | "moderate" | "complex";
  summary: string;
  insights: string[];
  context?: any; // For passing analysis context
}

export interface TextPatterns {
  hasContrasts: boolean;
  hasProgression: boolean;
  hasQuestions: boolean;
  hasExclamations: boolean;
  tenseUsed: "past" | "present" | "future" | "mixed";
  personalPronouns: string[];
  topics: string[];
  emotionalTriggers: string[];
  emotionalProgression: "stable" | "improving" | "declining" | "fluctuating";
  intensityWords: string[];
  uncertaintyWords: string[];
  achievementWords: string[];
  relationshipWords: string[];
  timeReferences: string[];
}

export const MOOD_CONFIGS: Record<Mood, MoodConfig> = {
  happy: {
    color: "#34C759",
    icon: "happy",
    description: "Feeling joyful and content",
    displayName: "Happy",
  },
  sad: {
    color: "#007AFF",
    icon: "sad",
    description: "Experiencing sadness or disappointment",
    displayName: "Sad",
  },
  angry: {
    color: "#FF3B30",
    icon: "flame",
    description: "Feeling frustrated or irritated",
    displayName: "Angry",
  },
  neutral: {
    color: "#8E8E93",
    icon: "remove-circle",
    description: "Balanced emotional state",
    displayName: "Neutral",
  },
  excited: {
    color: "#FFCC00",
    icon: "flash",
    description: "Feeling energetic and enthusiastic",
    displayName: "Excited",
  },
  calm: {
    color: "#5856D6",
    icon: "leaf",
    description: "Feeling peaceful and relaxed",
    displayName: "Calm",
  },
};

/**
 * Get mood configuration by mood type
 */
export const getMoodConfig = (mood: Mood): MoodConfig => {
  return MOOD_CONFIGS[mood] || MOOD_CONFIGS.neutral;
};

/**
 * Get mood color by mood type
 */
export const getMoodColor = (mood: Mood): string => {
  return getMoodConfig(mood).color;
};

/**
 * Get mood icon by mood type
 */
export const getMoodIcon = (mood: Mood): string => {
  return getMoodConfig(mood).icon;
};

/**
 * Get mood description by mood type
 */
export const getMoodDescription = (mood: Mood): string => {
  return getMoodConfig(mood).description;
};

/**
 * Determine emotion intensity based on confidence
 */
export const getEmotionIntensity = (
  confidence: number
): "low" | "medium" | "high" => {
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
};

/**
 * Analyze text for emotional keywords with context
 */
export const getEmotionalKeywords = (
  text: string
): { positive: string[]; negative: string[]; neutral: string[] } => {
  const lowerText = text.toLowerCase();

  const positiveKeywords = [
    "good",
    "great",
    "happy",
    "excited",
    "love",
    "amazing",
    "wonderful",
    "fantastic",
    "excellent",
    "perfect",
    "awesome",
    "brilliant",
    "outstanding",
    "superb",
    "terrific",
    "fine",
    "well",
    "better",
    "best",
    "enjoy",
    "pleased",
    "satisfied",
    "proud",
    "delighted",
    "thrilled",
    "cheerful",
    "joyful",
    "optimistic",
    "confident",
    "grateful",
    "blessed",
    "lucky",
    "successful",
    "accomplished",
    "relieved",
    "comfortable",
    "peaceful",
    "content",
    "smile",
    "laugh",
    "celebrate",
    "victory",
    "win",
    "achieve",
    "progress",
    "improve",
  ];

  const negativeKeywords = [
    "bad",
    "terrible",
    "awful",
    "hate",
    "sad",
    "angry",
    "frustrated",
    "disappointed",
    "upset",
    "worried",
    "anxious",
    "depressed",
    "horrible",
    "disgusting",
    "annoying",
    "problem",
    "issue",
    "difficult",
    "hard",
    "struggle",
    "fail",
    "wrong",
    "stressed",
    "overwhelmed",
    "exhausted",
    "tired",
    "confused",
    "lost",
    "hopeless",
    "scared",
    "nervous",
    "irritated",
    "annoyed",
    "furious",
    "devastated",
    "heartbroken",
    "miserable",
    "cry",
    "tears",
    "pain",
    "hurt",
    "broken",
    "defeat",
    "loss",
    "mistake",
  ];

  const neutralKeywords = [
    "okay",
    "fine",
    "alright",
    "normal",
    "average",
    "usual",
    "typical",
    "standard",
    "regular",
    "ordinary",
    "moderate",
    "balanced",
    "stable",
    "consistent",
    "routine",
    "expected",
    "reasonable",
    "acceptable",
    "think",
    "consider",
    "maybe",
    "perhaps",
    "possibly",
    "probably",
    "seems",
  ];

  return {
    positive: positiveKeywords.filter((word) => lowerText.includes(word)),
    negative: negativeKeywords.filter((word) => lowerText.includes(word)),
    neutral: neutralKeywords.filter((word) => lowerText.includes(word)),
  };
};

/**
 * Analyze text patterns for deeper emotional understanding
 */
export const analyzeTextPatterns = (text: string): TextPatterns => {
  const lowerText = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

  // Detect contrasts (but, however, although, etc.)
  const contrastWords = [
    "but",
    "however",
    "although",
    "though",
    "yet",
    "still",
    "nevertheless",
    "nonetheless",
    "on the other hand",
    "despite",
    "in spite of",
  ];
  const hasContrasts = contrastWords.some((word) => lowerText.includes(word));

  // Detect progression (then, after, later, now, etc.)
  const progressionWords = [
    "then",
    "after",
    "later",
    "now",
    "next",
    "finally",
    "eventually",
    "gradually",
    "suddenly",
    "immediately",
  ];
  const hasProgression = progressionWords.some((word) =>
    lowerText.includes(word)
  );

  // Detect questions and exclamations
  const hasQuestions = text.includes("?");
  const hasExclamations = text.includes("!");

  // Analyze tense usage
  const pastTenseWords = [
    "was",
    "were",
    "had",
    "did",
    "went",
    "came",
    "said",
    "felt",
    "thought",
    "happened",
    "occurred",
  ];
  const presentTenseWords = [
    "am",
    "is",
    "are",
    "have",
    "do",
    "go",
    "come",
    "say",
    "feel",
    "think",
    "happen",
    "occur",
  ];
  const futureWords = [
    "will",
    "going to",
    "plan to",
    "hope to",
    "want to",
    "intend to",
    "expect to",
    "tomorrow",
    "next",
    "soon",
    "later",
  ];

  const pastCount = pastTenseWords.filter((word) =>
    lowerText.includes(word)
  ).length;
  const presentCount = presentTenseWords.filter((word) =>
    lowerText.includes(word)
  ).length;
  const futureCount = futureWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  let tenseUsed: "past" | "present" | "future" | "mixed";
  if (pastCount > presentCount && pastCount > futureCount) {
    tenseUsed = "past";
  } else if (presentCount > pastCount && presentCount > futureCount) {
    tenseUsed = "present";
  } else if (futureCount > pastCount && futureCount > presentCount) {
    tenseUsed = "future";
  } else {
    tenseUsed = "mixed";
  }

  // Extract personal pronouns
  const pronounRegex = /\b(i|me|my|myself|we|us|our|ourselves)\b/gi;
  const personalPronouns = [
    ...new Set((text.match(pronounRegex) || []).map((p) => p.toLowerCase())),
  ];

  // Detect topics/themes
  const topics: string[] = [];
  const topicKeywords = {
    work: [
      "work",
      "job",
      "career",
      "office",
      "boss",
      "colleague",
      "meeting",
      "project",
      "deadline",
      "salary",
    ],
    education: [
      "school",
      "university",
      "college",
      "exam",
      "test",
      "study",
      "homework",
      "assignment",
      "grade",
      "teacher",
      "professor",
      "class",
      "lecture",
    ],
    relationships: [
      "friend",
      "family",
      "partner",
      "boyfriend",
      "girlfriend",
      "husband",
      "wife",
      "mother",
      "father",
      "parent",
      "child",
      "sibling",
      "relationship",
    ],
    health: [
      "health",
      "doctor",
      "hospital",
      "sick",
      "illness",
      "medicine",
      "therapy",
      "exercise",
      "diet",
      "sleep",
    ],
    personal: [
      "myself",
      "personal",
      "growth",
      "change",
      "decision",
      "choice",
      "future",
      "goal",
      "dream",
      "hope",
    ],
  };

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  });

  // Detect emotional triggers
  const emotionalTriggers: string[] = [];
  const triggerPatterns = {
    failure: [
      "failed",
      "failure",
      "mistake",
      "wrong",
      "messed up",
      "screwed up",
    ],
    success: [
      "succeeded",
      "success",
      "achieved",
      "accomplished",
      "won",
      "victory",
    ],
    rejection: ["rejected", "rejection", "ignored", "dismissed", "turned down"],
    acceptance: ["accepted", "approval", "welcomed", "included", "chosen"],
    loss: ["lost", "loss", "gone", "missing", "ended", "over"],
    gain: ["gained", "got", "received", "earned", "found", "discovered"],
  };

  Object.entries(triggerPatterns).forEach(([trigger, patterns]) => {
    if (patterns.some((pattern) => lowerText.includes(pattern))) {
      emotionalTriggers.push(trigger);
    }
  });

  // Analyze emotional progression through sentences
  let emotionalProgression:
    | "stable"
    | "improving"
    | "declining"
    | "fluctuating" = "stable";
  if (sentences.length > 2) {
    const firstHalf = sentences
      .slice(0, Math.ceil(sentences.length / 2))
      .join(" ")
      .toLowerCase();
    const secondHalf = sentences
      .slice(Math.ceil(sentences.length / 2))
      .join(" ")
      .toLowerCase();

    const firstHalfPositive = getEmotionalKeywords(firstHalf).positive.length;
    const firstHalfNegative = getEmotionalKeywords(firstHalf).negative.length;
    const secondHalfPositive = getEmotionalKeywords(secondHalf).positive.length;
    const secondHalfNegative = getEmotionalKeywords(secondHalf).negative.length;

    const firstHalfScore = firstHalfPositive - firstHalfNegative;
    const secondHalfScore = secondHalfPositive - secondHalfNegative;

    if (secondHalfScore > firstHalfScore + 1) {
      emotionalProgression = "improving";
    } else if (firstHalfScore > secondHalfScore + 1) {
      emotionalProgression = "declining";
    } else if (Math.abs(firstHalfScore - secondHalfScore) > 2) {
      emotionalProgression = "fluctuating";
    }
  }

  // Extract intensity words
  const intensityWords = [
    "very",
    "extremely",
    "incredibly",
    "absolutely",
    "completely",
    "totally",
    "really",
    "quite",
    "rather",
    "somewhat",
    "slightly",
    "barely",
    "hardly",
  ];
  const foundIntensityWords = intensityWords.filter((word) =>
    lowerText.includes(word)
  );

  // Extract uncertainty words
  const uncertaintyWords = [
    "maybe",
    "perhaps",
    "possibly",
    "probably",
    "might",
    "could",
    "would",
    "should",
    "unsure",
    "uncertain",
    "confused",
    "don't know",
  ];
  const foundUncertaintyWords = uncertaintyWords.filter((word) =>
    lowerText.includes(word)
  );

  // Extract achievement words
  const achievementWords = [
    "achieved",
    "accomplished",
    "completed",
    "finished",
    "succeeded",
    "won",
    "earned",
    "gained",
    "improved",
    "progressed",
  ];
  const foundAchievementWords = achievementWords.filter((word) =>
    lowerText.includes(word)
  );

  // Extract relationship words
  const relationshipWords = [
    "together",
    "apart",
    "close",
    "distant",
    "connected",
    "isolated",
    "supported",
    "alone",
    "loved",
    "rejected",
  ];
  const foundRelationshipWords = relationshipWords.filter((word) =>
    lowerText.includes(word)
  );

  // Extract time references
  const timeWords = [
    "today",
    "yesterday",
    "tomorrow",
    "now",
    "then",
    "recently",
    "soon",
    "later",
    "before",
    "after",
    "during",
    "while",
  ];
  const foundTimeReferences = timeWords.filter((word) =>
    lowerText.includes(word)
  );

  return {
    hasContrasts,
    hasProgression,
    hasQuestions,
    hasExclamations,
    tenseUsed,
    personalPronouns,
    topics,
    emotionalTriggers,
    emotionalProgression,
    intensityWords: foundIntensityWords,
    uncertaintyWords: foundUncertaintyWords,
    achievementWords: foundAchievementWords,
    relationshipWords: foundRelationshipWords,
    timeReferences: foundTimeReferences,
  };
};

/**
 * Generate natural language summary of emotions
 */
export const generateEmotionalSummary = (
  analysis: ComprehensiveMoodAnalysis
): string => {
  const {
    primaryEmotion,
    secondaryEmotions,
    overallSentiment,
    emotionalComplexity,
  } = analysis;

  let summary = "";

  if (emotionalComplexity === "simple") {
    const intensityWord =
      primaryEmotion.intensity === "high"
        ? "very"
        : primaryEmotion.intensity === "medium"
        ? "somewhat"
        : "slightly";
    summary = `You're feeling ${intensityWord} ${primaryEmotion.emotion} today.`;
  } else if (emotionalComplexity === "moderate") {
    const primary = primaryEmotion.emotion;
    const secondary = secondaryEmotions[0]?.emotion;

    if (overallSentiment === "mixed") {
      summary = `You're experiencing mixed emotions - primarily ${primary}, but also feeling ${secondary}.`;
    } else {
      summary = `You're mainly feeling ${primary}, with some ${secondary} mixed in.`;
    }
  } else {
    // Complex emotions
    const emotions = [primaryEmotion, ...secondaryEmotions.slice(0, 2)]
      .map((e) => e.emotion)
      .join(", ");
    summary = `You're experiencing a complex mix of emotions including ${emotions}.`;
  }

  return summary;
};

/**
 * Advanced text analysis for dynamic insight generation
 */
interface AdvancedTextAnalysis {
  // Linguistic patterns
  sentimentFlow: Array<{ position: number; sentiment: number; emotion: Mood }>;
  linguisticComplexity: "simple" | "moderate" | "complex";
  emotionalIntensityMap: Map<string, number>;

  // Content analysis
  specificConcerns: string[];
  copingMechanisms: string[];
  supportSystems: string[];
  stressors: string[];
  positiveFactors: string[];

  // Behavioral indicators
  actionWords: string[];
  thoughtPatterns: "ruminating" | "problem-solving" | "accepting" | "avoiding";
  timeOrientation: { past: number; present: number; future: number };

  // Contextual factors
  situationalContext: string[];
  emotionalTriggerContext: Map<string, string[]>;
  relationshipDynamics: string[];
}

/**
 * Extract specific concerns and issues from text
 */
const extractSpecificConcerns = (text: string): string[] => {
  const concerns: string[] = [];
  const lowerText = text.toLowerCase();

  // Pattern matching for concerns
  const concernPatterns = [
    { pattern: /worried about (.+?)[\.\,\!]/, type: "worry" },
    { pattern: /stressed about (.+?)[\.\,\!]/, type: "stress" },
    { pattern: /can't (.+?)[\.\,\!]/, type: "inability" },
    { pattern: /don't know (.+?)[\.\,\!]/, type: "uncertainty" },
    { pattern: /afraid (.+?)[\.\,\!]/, type: "fear" },
    { pattern: /struggling with (.+?)[\.\,\!]/, type: "struggle" },
    { pattern: /having trouble (.+?)[\.\,\!]/, type: "difficulty" },
    { pattern: /feel like (.+?)[\.\,\!]/, type: "feeling" },
  ];

  concernPatterns.forEach(({ pattern, type }) => {
    const matches = text.match(pattern);
    if (matches && matches[1]) {
      concerns.push(`${type}: ${matches[1].trim()}`);
    }
  });

  return concerns;
};

/**
 * Identify coping mechanisms mentioned in text
 */
const identifyCopingMechanisms = (text: string): string[] => {
  const mechanisms: string[] = [];
  const lowerText = text.toLowerCase();

  const copingPatterns = [
    {
      keywords: ["talked to", "spoke with", "called"],
      mechanism: "social support",
    },
    {
      keywords: ["exercise", "workout", "run", "walk"],
      mechanism: "physical activity",
    },
    { keywords: ["meditate", "breathe", "calm"], mechanism: "mindfulness" },
    {
      keywords: ["write", "journal", "wrote"],
      mechanism: "expressive writing",
    },
    { keywords: ["music", "listen", "song"], mechanism: "music therapy" },
    { keywords: ["sleep", "rest", "nap"], mechanism: "rest and recovery" },
    {
      keywords: ["plan", "organize", "schedule"],
      mechanism: "problem-solving",
    },
    {
      keywords: ["pray", "faith", "spiritual"],
      mechanism: "spiritual practice",
    },
  ];

  copingPatterns.forEach(({ keywords, mechanism }) => {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      mechanisms.push(mechanism);
    }
  });

  return mechanisms;
};

/**
 * Analyze thought patterns from text structure and content
 */
const analyzeThoughtPatterns = (
  text: string,
  sentences: string[]
): "ruminating" | "problem-solving" | "accepting" | "avoiding" => {
  const lowerText = text.toLowerCase();

  // Ruminating indicators
  const ruminatingWords = [
    "keep thinking",
    "can't stop",
    "over and over",
    "why did",
    "what if",
    "should have",
    "could have",
  ];
  const ruminatingCount = ruminatingWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  // Problem-solving indicators
  const problemSolvingWords = [
    "need to",
    "going to",
    "plan to",
    "will try",
    "maybe i can",
    "i should",
    "next step",
  ];
  const problemSolvingCount = problemSolvingWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  // Accepting indicators
  const acceptingWords = [
    "it is what it is",
    "accept",
    "let go",
    "move on",
    "okay with",
    "understand that",
  ];
  const acceptingCount = acceptingWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  // Avoiding indicators
  const avoidingWords = [
    "don't want to think",
    "ignore",
    "forget about",
    "distract myself",
    "avoid",
  ];
  const avoidingCount = avoidingWords.filter((word) =>
    lowerText.includes(word)
  ).length;

  const scores = {
    ruminating: ruminatingCount,
    "problem-solving": problemSolvingCount,
    accepting: acceptingCount,
    avoiding: avoidingCount,
  } as const;

  const entries = Object.entries(scores) as Array<
    [keyof typeof scores, number]
  >;
  return entries.reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b))[0];
};
/**
 * Perform advanced text analysis
 */
const performAdvancedTextAnalysis = (
  text: string,
  sentenceEmotions: any[]
): AdvancedTextAnalysis => {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const lowerText = text.toLowerCase();

  // Analyze sentiment flow
  const sentimentFlow = sentenceEmotions.map((sentEmotion, index) => ({
    position: index / sentenceEmotions.length,
    sentiment: sentEmotion.emotions[0]?.confidence || 0,
    emotion: sentEmotion.dominantEmotion,
  }));

  // Determine linguistic complexity
  const avgWordsPerSentence = text.split(" ").length / sentences.length;
  const complexWords = text.split(" ").filter((word) => word.length > 7).length;
  const linguisticComplexity =
    avgWordsPerSentence > 15 && complexWords > 5
      ? "complex"
      : avgWordsPerSentence > 10
      ? "moderate"
      : "simple";

  // Extract specific elements
  const specificConcerns = extractSpecificConcerns(text);
  const copingMechanisms = identifyCopingMechanisms(text);
  const thoughtPatterns = analyzeThoughtPatterns(text, sentences);

  // Analyze time orientation
  const pastWords = [
    "was",
    "were",
    "had",
    "did",
    "yesterday",
    "before",
    "earlier",
    "used to",
  ];
  const presentWords = [
    "am",
    "is",
    "are",
    "now",
    "today",
    "currently",
    "right now",
  ];
  const futureWords = [
    "will",
    "going to",
    "tomorrow",
    "next",
    "plan to",
    "hope to",
  ];

  const timeOrientation = {
    past: pastWords.filter((word) => lowerText.includes(word)).length,
    present: presentWords.filter((word) => lowerText.includes(word)).length,
    future: futureWords.filter((word) => lowerText.includes(word)).length,
  };

  // Extract action words
  const actionWords =
    text.match(
      /\b(going to|will|need to|want to|trying to|decided to|planning to)\s+(\w+)/g
    ) || [];

  // Identify support systems
  const supportSystems: string[] = [];
  if (lowerText.includes("friend") || lowerText.includes("friends"))
    supportSystems.push("friends");
  if (lowerText.includes("family") || lowerText.includes("parents"))
    supportSystems.push("family");
  if (lowerText.includes("therapist") || lowerText.includes("counselor"))
    supportSystems.push("professional help");
  if (
    lowerText.includes("partner") ||
    lowerText.includes("boyfriend") ||
    lowerText.includes("girlfriend")
  )
    supportSystems.push("romantic partner");

  // Identify stressors and positive factors
  const stressors: string[] = [];
  const positiveFactors: string[] = [];

  // Context-specific analysis
  const situationalContext: string[] = [];
  if (lowerText.includes("exam") || lowerText.includes("test"))
    situationalContext.push("academic evaluation");
  if (lowerText.includes("interview") || lowerText.includes("job"))
    situationalContext.push("career transition");
  if (lowerText.includes("relationship") || lowerText.includes("breakup"))
    situationalContext.push("relationship change");
  if (lowerText.includes("health") || lowerText.includes("sick"))
    situationalContext.push("health concern");

  return {
    sentimentFlow,
    linguisticComplexity,
    emotionalIntensityMap: new Map(),
    specificConcerns,
    copingMechanisms,
    supportSystems,
    stressors,
    positiveFactors,
    actionWords,
    thoughtPatterns,
    timeOrientation,
    situationalContext,
    emotionalTriggerContext: new Map(),
    relationshipDynamics: [],
  };
};

/**
 * Generate truly dynamic insights based on comprehensive analysis
 */
export const generateEmotionalInsights = (
  analysis: ComprehensiveMoodAnalysis,
  context: any
): string[] => {
  const insights: string[] = [];
  const { primaryEmotion, secondaryEmotions, overallSentiment } = analysis;

  if (!context || !context.textPatterns) {
    return [
      "Your emotional expression shows self-awareness, which is important for mental well-being.",
    ];
  }

  const patterns = context.textPatterns;
  const keywords = context.emotionalKeywords;
  const sentenceEmotions = context.sentenceEmotions || [];

  // Perform advanced analysis
  const advancedAnalysis = performAdvancedTextAnalysis(
    context.originalText,
    sentenceEmotions
  );

  // Generate insights based on specific concerns
  if (advancedAnalysis.specificConcerns.length > 0) {
    advancedAnalysis.specificConcerns.forEach((concern) => {
      const [type, content] = concern.split(": ");
      switch (type) {
        case "worry":
          insights.push(
            `Your worry about ${content} shows you care deeply about the outcome. Consider what aspects you can influence versus what's beyond your control.`
          );
          break;
        case "uncertainty":
          insights.push(
            `Not knowing ${content} is creating emotional tension. Sometimes acknowledging uncertainty is the first step toward finding clarity.`
          );
          break;
        case "struggle":
          insights.push(
            `Struggling with ${content} is challenging, but recognizing the struggle means you're actively engaged in working through it.`
          );
          break;
        case "fear":
          insights.push(
            `Your fear about ${content} is a natural protective response. Consider what small steps might help you feel more prepared or supported.`
          );
          break;
      }
    });
  }

  // Analyze coping mechanisms
  if (advancedAnalysis.copingMechanisms.length > 0) {
    const copingList = advancedAnalysis.copingMechanisms.join(", ");
    insights.push(
      `You're already using healthy coping strategies like ${copingList}. Building on these existing strengths can help you navigate current challenges.`
    );
  } else if (["sad", "angry"].includes(primaryEmotion.emotion)) {
    insights.push(
      `You're experiencing difficult emotions without mentioning specific coping strategies. Consider what has helped you through tough times before.`
    );
  }

  // Analyze thought patterns
  switch (advancedAnalysis.thoughtPatterns) {
    case "ruminating":
      insights.push(
        `Your thoughts seem to be cycling around the same concerns. Try setting aside specific "worry time" or engaging in activities that require focus to break the cycle.`
      );
      break;
    case "problem-solving":
      insights.push(
        `You're actively thinking through solutions and next steps, which shows resilience and forward-thinking even during difficult times.`
      );
      break;
    case "accepting":
      insights.push(
        `Your acceptance of the situation shows emotional maturity. This mindset often creates space for new possibilities to emerge.`
      );
      break;
    case "avoiding":
      insights.push(
        `You seem to be avoiding thinking about certain aspects of your situation. While this can provide temporary relief, gentle acknowledgment might help long-term.`
      );
      break;
  }

  // Analyze time orientation
  const totalTimeWords =
    advancedAnalysis.timeOrientation.past +
    advancedAnalysis.timeOrientation.present +
    advancedAnalysis.timeOrientation.future;
  if (totalTimeWords > 0) {
    const pastRatio = advancedAnalysis.timeOrientation.past / totalTimeWords;
    const futureRatio =
      advancedAnalysis.timeOrientation.future / totalTimeWords;

    if (pastRatio > 0.6) {
      insights.push(
        `You're spending significant mental energy on past events. While reflection is valuable, consider how these experiences inform your present choices.`
      );
    } else if (futureRatio > 0.6) {
      insights.push(
        `Your focus on future possibilities shows hope and planning. Balancing this with present-moment awareness can reduce anxiety about unknowns.`
      );
    }
  }

  // Analyze support systems
  if (advancedAnalysis.supportSystems.length > 0) {
    const supportList = advancedAnalysis.supportSystems.join(" and ");
    insights.push(
      `You mention ${supportList} as part of your life. These connections are valuable resources, especially during emotionally challenging times.`
    );
  } else if (["sad", "angry"].includes(primaryEmotion.emotion)) {
    insights.push(
      `You don't mention specific people in your support network. Reaching out to trusted individuals, even briefly, can provide perspective and comfort.`
    );
  }

  // Analyze emotional progression through sentiment flow
  if (advancedAnalysis.sentimentFlow.length > 2) {
    const startSentiment = advancedAnalysis.sentimentFlow[0].sentiment;
    const endSentiment =
      advancedAnalysis.sentimentFlow[advancedAnalysis.sentimentFlow.length - 1]
        .sentiment;
    const sentimentChange = endSentiment - startSentiment;

    if (sentimentChange > 0.2) {
      insights.push(
        `Your emotional tone becomes more positive as you write, suggesting that expressing these thoughts is helping you process and find perspective.`
      );
    } else if (sentimentChange < -0.2) {
      insights.push(
        `Your emotional tone becomes more challenging as you delve deeper into your thoughts. This depth of processing, while difficult, can lead to important insights.`
      );
    }
  }

  // Analyze situational context
  if (advancedAnalysis.situationalContext.length > 0) {
    advancedAnalysis.situationalContext.forEach((context) => {
      switch (context) {
        case "academic evaluation":
          insights.push(
            `Academic evaluations can trigger intense emotions because they feel like judgments of our abilities. Remember that one test or exam doesn't define your intelligence or potential.`
          );
          break;
        case "career transition":
          insights.push(
            `Career changes involve both opportunity and uncertainty, which naturally creates mixed emotions. Your feelings reflect the significance of this transition in your life.`
          );
          break;
        case "relationship change":
          insights.push(
            `Relationship changes affect us deeply because they touch our fundamental need for connection. The emotions you're experiencing are a natural response to this significant life shift.`
          );
          break;
        case "health concern":
          insights.push(
            `Health-related worries can amplify all other emotions because they affect our sense of security. Taking care of your emotional well-being is just as important as addressing physical concerns.`
          );
          break;
      }
    });
  }

  // Analyze linguistic complexity and emotional expression
  if (
    advancedAnalysis.linguisticComplexity === "complex" &&
    primaryEmotion.intensity === "high"
  ) {
    insights.push(
      `Your detailed and complex way of expressing these emotions shows deep self-reflection. This level of emotional articulation is a strength that can help you work through difficult feelings.`
    );
  } else if (
    advancedAnalysis.linguisticComplexity === "simple" &&
    primaryEmotion.intensity === "high"
  ) {
    insights.push(
      `Sometimes the most intense emotions are hardest to put into words. The simplicity of your expression doesn't diminish the validity or importance of what you're feeling.`
    );
  }

  // Analyze action orientation
  if (advancedAnalysis.actionWords.length > 2) {
    insights.push(
      `You mention several actions you're taking or planning to take. This action-oriented approach shows you're not just experiencing emotions passively, but actively working to address your situation.`
    );
  } else if (["sad", "angry"].includes(primaryEmotion.emotion)) {
    insights.push(
      `Your emotions seem overwhelming right now, which can make it hard to think about next steps. Sometimes just acknowledging how you feel is the first important action.`
    );
  }

  // Generate insights based on emotional complexity patterns
  if (secondaryEmotions.length > 1) {
    const emotionNames = [
      primaryEmotion.emotion,
      ...secondaryEmotions.map((e) => e.emotion),
    ];
    const hasConflictingEmotions =
      (emotionNames.includes("happy") || emotionNames.includes("excited")) &&
      (emotionNames.includes("sad") || emotionNames.includes("angry"));

    if (hasConflictingEmotions) {
      insights.push(
        `You're experiencing conflicting emotions simultaneously, which shows you're processing a complex situation. This emotional complexity is normal when dealing with significant life events.`
      );
    }
  }

  // Analyze emotional triggers in context
  if (patterns.emotionalTriggers.length > 0) {
    const triggerInsights = generateTriggerSpecificInsights(
      patterns.emotionalTriggers,
      advancedAnalysis,
      primaryEmotion.emotion
    );
    insights.push(...triggerInsights);
  }

  // Generate personalized recommendations based on analysis
  const recommendations = generatePersonalizedRecommendations(
    advancedAnalysis,
    primaryEmotion.emotion
  );
  insights.push(...recommendations);

  // Ensure insights are unique and relevant
  const uniqueInsights = [...new Set(insights)];

  // If no specific insights generated, create contextual fallback
  if (uniqueInsights.length === 0) {
    uniqueInsights.push(
      generateContextualFallback(context.originalText, primaryEmotion.emotion)
    );
  }

  // Return most relevant insights (limit to 4-6 for readability)
  return uniqueInsights.slice(0, Math.min(6, uniqueInsights.length));
};

/**
 * Generate trigger-specific insights based on context
 */
const generateTriggerSpecificInsights = (
  triggers: string[],
  analysis: AdvancedTextAnalysis,
  primaryEmotion: Mood
): string[] => {
  const insights: string[] = [];

  triggers.forEach((trigger) => {
    switch (trigger) {
      case "failure":
        if (analysis.thoughtPatterns === "ruminating") {
          insights.push(
            `The sense of failure is creating a cycle of repetitive thoughts. Consider what you learned from this experience rather than focusing solely on the outcome.`
          );
        } else if (analysis.copingMechanisms.length > 0) {
          insights.push(
            `Despite feeling like you failed, you're actively using coping strategies, which shows resilience and self-care awareness.`
          );
        } else {
          insights.push(
            `Experiencing failure is difficult, but your willingness to acknowledge and process these feelings is actually a form of emotional courage.`
          );
        }
        break;

      case "success":
        if (primaryEmotion === "excited") {
          insights.push(
            `Your excitement about this success comes through clearly. Savoring these positive moments helps build emotional resilience for future challenges.`
          );
        } else if (
          analysis.timeOrientation.future > analysis.timeOrientation.present
        ) {
          insights.push(
            `Even while experiencing success, you're thinking ahead to future challenges. Balancing celebration with planning shows both gratitude and ambition.`
          );
        }
        break;

      case "rejection":
        if (analysis.supportSystems.length > 0) {
          insights.push(
            `Being rejected is painful, but you have support systems in place. Leaning on these connections can help you process this experience and maintain perspective.`
          );
        } else {
          insights.push(
            `Rejection affects our sense of belonging and worth. Remember that one person's or institution's decision doesn't define your value or potential.`
          );
        }
        break;

      case "loss":
        if (analysis.timeOrientation.past > 0.5) {
          insights.push(
            `You're spending time remembering what you've lost, which is a natural part of grieving. Allow yourself this reflection while also being gentle about when to engage with the present.`
          );
        } else {
          insights.push(
            `Loss creates a complex mix of emotions that can't be rushed through. Your feelings are valid and deserve the time they need to be processed.`
          );
        }
        break;
    }
  });

  return insights;
};

/**
 * Generate personalized recommendations based on comprehensive analysis
 */
const generatePersonalizedRecommendations = (
  analysis: AdvancedTextAnalysis,
  primaryEmotion: Mood
): string[] => {
  const recommendations: string[] = [];

  // Recommendations based on thought patterns
  if (
    analysis.thoughtPatterns === "ruminating" &&
    analysis.copingMechanisms.length === 0
  ) {
    recommendations.push(
      `Since you're caught in repetitive thoughts, try the "5-4-3-2-1" grounding technique: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.`
    );
  }

  // Recommendations based on support systems
  if (
    analysis.supportSystems.length === 0 &&
    ["sad", "angry"].includes(primaryEmotion)
  ) {
    recommendations.push(
      `Consider reaching out to someone you trust, even if it's just to say you're having a tough day. Connection doesn't require explaining everything.`
    );
  }

  // Recommendations based on time orientation
  if (
    analysis.timeOrientation.past >
    analysis.timeOrientation.present + analysis.timeOrientation.future
  ) {
    recommendations.push(
      `Try spending 10 minutes focusing on something in your immediate environment - what you can see, hear, or do right now.`
    );
  }

  // Recommendations based on situational context
  if (
    analysis.situationalContext.includes("academic evaluation") &&
    primaryEmotion === "sad"
  ) {
    recommendations.push(
      `Academic setbacks feel overwhelming because they seem to predict the future, but they're actually just information about one moment in time.`
    );
  }

  return recommendations;
};

/**
 * Generate contextual fallback insight when specific patterns aren't detected
 */
const generateContextualFallback = (text: string, emotion: Mood): string => {
  const wordCount = text.split(" ").length;
  const sentenceCount = text.split(/[.!?]+/).length;

  if (wordCount > 100) {
    return `Your detailed expression of these ${emotion} feelings shows you're taking time to understand your emotional experience, which is an important step in processing complex situations.`;
  } else if (sentenceCount === 1) {
    return `Even though you've expressed this briefly, the ${emotion} emotion you're experiencing is valid and worth acknowledging.`;
  } else {
    return `Your ${emotion} feelings come through clearly in your writing. Taking time to express and examine emotions like this is a valuable form of self-care.`;
  }
};
