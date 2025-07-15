// Gladia Whisper integration
export const transcribeAudio = async (audioUri: string): Promise<string> => {
  console.log('[STT] Starting transcription for:', audioUri);
  
  try {
    const formData = new FormData();

    // Log the audio file details
    console.log('[STT] Preparing audio file for upload');
    
    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    } as any);

    console.log('[STT] Making API request to Gladia...');
    
    const response = await fetch("https://api.gladia.io/audio/text/audio-transcription/", {
      method: "POST",
      headers: {
        "x-gladia-key": "7125e879-0b25-4bc5-9429-d2140321bf11",
      },
      body: formData,
    });

    console.log('[STT] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[STT] API Error Response:', errorText);
      throw new Error(`STT request failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[STT] API Response:', JSON.stringify(data, null, 2));
    
    // Handle the actual Gladia response structure
    let transcription = '';
    
    // Try different possible response structures
    if (data.prediction && Array.isArray(data.prediction) && data.prediction.length > 0) {
      // Gladia's actual response structure - combine all segments
      const segments = data.prediction.map((segment: any) => segment.transcription).filter(Boolean);
      transcription = segments.join(' ');
      console.log('[STT] Found transcription segments:', segments.length);
      console.log('[STT] Combined transcription:', transcription);
    } else if (data.prediction_raw && data.prediction_raw.transcription && Array.isArray(data.prediction_raw.transcription) && data.prediction_raw.transcription.length > 0) {
      // Alternative structure in prediction_raw - combine all segments
      const segments = data.prediction_raw.transcription.map((segment: any) => segment.transcription).filter(Boolean);
      transcription = segments.join(' ');
      console.log('[STT] Found transcription in prediction_raw, segments:', segments.length);
      console.log('[STT] Combined transcription:', transcription);
    } else if (data.result && data.result.transcription) {
      // Old structure (fallback)
      transcription = data.result.transcription;
      console.log('[STT] Found transcription in result:', transcription);
    } else if (data.transcription) {
      // Direct transcription field
      transcription = data.transcription;
      console.log('[STT] Found direct transcription:', transcription);
    } else if (data.text) {
      // Text field
      transcription = data.text;
      console.log('[STT] Found transcription in text field:', transcription);
    }
    
    if (!transcription || transcription.trim() === '') {
      console.error('[STT] No transcription found in response structure:', {
        hasPrediction: !!data.prediction,
        predictionLength: data.prediction?.length,
        hasPredictionRaw: !!data.prediction_raw,
        hasResult: !!data.result,
        hasTranscription: !!data.transcription,
        hasText: !!data.text
      });
      throw new Error('No transcription received from service');
    }
    
    console.log('[STT] Transcription successful:', transcription);
    return transcription.trim();
  } catch (error) {
    console.error("[STT Error]:", error);
    throw error; // Re-throw the original error for better debugging
  }
};
