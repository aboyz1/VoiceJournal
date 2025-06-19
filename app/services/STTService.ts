type STTResponse = {
  text: string;
  confidence: number;
  language: string;
};

export const transcribeAudio = async (
  audioUri: string
): Promise<STTResponse> => {
  // Demo/mock response for development
  return new Promise<STTResponse>((resolve) => {
    setTimeout(() => {
      resolve({
        text: "This is a demo transcription of your audio entry.",
        confidence: 0.98,
        language: "en-US",
      });
    }, 1200);
  });

  // Uncomment below to use real API
  /*
  try {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

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
  */
};
