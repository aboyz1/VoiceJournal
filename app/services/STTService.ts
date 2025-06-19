import axios from 'axios';

type STTResponse = {
  text: string;
  confidence: number;
  language: string;
};

export const transcribeAudio = async (audioUri: string): Promise<STTResponse> => {
  try {
    // Create FormData with the audio file
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a', // Match your recording format
      name: 'recording.m4a',
    } as any);

    // Replace with your actual STT API endpoint
    const response = await axios.post('https://api.your-stt-service.com/v1/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': 'Bearer YOUR_API_KEY',
      },
    });

    return {
      text: response.data.transcript,
      confidence: response.data.confidence,
      language: response.data.language,
    };
  } catch (error) {
    console.error('STT Error:', error);
    throw new Error('Transcription failed. Please try again.');
  }
};