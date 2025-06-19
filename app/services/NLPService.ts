import axios from 'axios';

export type Mood = 'happy' | 'sad' | 'angry' | 'neutral' | 'excited' | 'calm';

type NLPAnalysis = {
  mood: Mood;
  confidence: number;
  keywords: string[];
  summary?: string;
  sentimentScore: number;
};

export const analyzeText = async (text: string): Promise<NLPAnalysis> => {
  try {
    // Replace with your actual NLP API endpoint
    const response = await axios.post('https://api.your-nlp-service.com/v1/analyze', {
      text,
      features: ['sentiment', 'keywords', 'summary'],
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_API_KEY',
      },
    });

    return {
      mood: mapSentimentToMood(response.data.sentiment.score),
      confidence: response.data.sentiment.confidence,
      keywords: response.data.keywords,
      summary: response.data.summary,
      sentimentScore: response.data.sentiment.score,
    };
  } catch (error) {
    console.error('NLP Error:', error);
    throw new Error('Analysis failed. Please try again.');
  }
};

// Helper function to convert sentiment score to mood categories
const mapSentimentToMood = (score: number): Mood => {
  if (score > 0.6) return 'excited';
  if (score > 0.3) return 'happy';
  if (score > -0.3) return 'neutral';
  if (score > -0.6) return 'sad';
  return 'angry';
};