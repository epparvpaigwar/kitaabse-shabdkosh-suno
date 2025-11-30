import { UploadBookRequest } from './bookService';
import { BASE_URL } from './api';

// SSE Event types matching new backend
export interface SSEEvent {
  type: 'status' | 'processing_started' | 'text_progress' | 'audio_started' | 'audio_progress' | 'completed' | 'error';
  data: any;
}

// Upload stages for better UX
export type UploadStage =
  | 'idle'
  | 'uploading'           // Initial upload
  | 'extracting_text'     // OCR/text extraction in progress
  | 'generating_audio'    // Audio generation in progress
  | 'completed'
  | 'error';

export interface UploadProgress {
  currentPage: number;
  totalPages: number;
  progress: number;           // Overall progress (0-100)
  message: string;            // Current status message
  status: UploadStage;
  // Detailed stage info
  stage?: {
    name: string;             // Human readable stage name
    detail?: string;          // Additional detail (e.g., "Page 3/10")
    subProgress?: number;     // Progress within current stage
  };
  // Audio generation specific
  audioStats?: {
    generated: number;
    failed: number;
    skipped: number;
    currentDuration?: number;
  };
}

export interface SSEUploadCallbacks {
  onProgress?: (progress: UploadProgress) => void;
  onCompleted?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Upload a book with SSE real-time progress updates
 */
export const uploadBookWithSSE = async (
  data: UploadBookRequest,
  callbacks: SSEUploadCallbacks
): Promise<void> => {
  const formData = new FormData();

  // Add all form fields
  formData.append('title', data.title);
  if (data.author) formData.append('author', data.author);
  if (data.description) formData.append('description', data.description);
  formData.append('language', data.language);
  if (data.genre) formData.append('genre', data.genre);
  formData.append('pdf_file', data.pdf_file);
  if (data.cover_image) formData.append('cover_image', data.cover_image);
  if (data.is_public !== undefined) formData.append('is_public', String(data.is_public));

  const token = localStorage.getItem('token');

  try {
    // Use query parameter ?stream=true instead of Accept header
    const response = await fetch(`${BASE_URL}/api/audiobooks/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No Accept header needed - using query param instead
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    const readStream = async (): Promise<void> => {
      const { done, value } = await reader.read();

      if (done) {
        return;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');

      // Keep the last incomplete event in buffer
      buffer = events.pop() || '';

      for (const eventText of events) {
        if (!eventText.trim()) continue;

        try {
          const event = parseSSEEvent(eventText);
          handleSSEEvent(event, callbacks);
        } catch (error) {
          console.error('Error parsing SSE event:', error, eventText);
        }
      }

      // Continue reading
      return readStream();
    };

    await readStream();
  } catch (error: any) {
    const errorMessage = error.message || 'Upload failed';
    callbacks.onError?.(errorMessage);
    throw error;
  }
};

/**
 * Parse SSE event text into structured event object
 */
function parseSSEEvent(eventText: string): SSEEvent {
  const lines = eventText.split('\n');
  let eventType = 'message';
  let eventData = '';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.substring(6).trim();
    } else if (line.startsWith('data:')) {
      eventData = line.substring(5).trim();
    }
  }

  return {
    type: eventType as SSEEvent['type'],
    data: JSON.parse(eventData),
  };
}

// Track audio stats across events
let audioStats = { generated: 0, failed: 0, skipped: 0, totalDuration: 0 };

/**
 * Handle different SSE event types from new backend
 */
function handleSSEEvent(event: SSEEvent, callbacks: SSEUploadCallbacks): void {
  switch (event.type) {
    case 'status':
      // General status messages (e.g., "Starting upload process...", "Creating book record...")
      callbacks.onProgress?.({
        currentPage: 0,
        totalPages: 0,
        progress: 5,
        message: event.data.message,
        status: 'uploading',
        stage: {
          name: 'Preparing',
          detail: event.data.message,
        },
      });
      break;

    case 'processing_started':
      // Text extraction started - reset audio stats
      audioStats = { generated: 0, failed: 0, skipped: 0, totalDuration: 0 };
      callbacks.onProgress?.({
        currentPage: 0,
        totalPages: event.data.total_pages,
        progress: 10,
        message: event.data.message || `Extracting text from ${event.data.total_pages} pages...`,
        status: 'extracting_text',
        stage: {
          name: 'Text Extraction',
          detail: `0/${event.data.total_pages} pages`,
          subProgress: 0,
        },
      });
      break;

    case 'text_progress':
      // Individual page text extraction progress
      const textProgress = Math.round((event.data.current_page / event.data.total_pages) * 40) + 10; // 10-50%
      callbacks.onProgress?.({
        currentPage: event.data.current_page,
        totalPages: event.data.total_pages,
        progress: textProgress,
        message: event.data.message || `Extracting text: page ${event.data.current_page} of ${event.data.total_pages}`,
        status: 'extracting_text',
        stage: {
          name: 'Text Extraction',
          detail: `${event.data.current_page}/${event.data.total_pages} pages`,
          subProgress: Math.round((event.data.current_page / event.data.total_pages) * 100),
        },
      });
      break;

    case 'audio_started':
      // Audio generation started (after text extraction complete)
      callbacks.onProgress?.({
        currentPage: 0,
        totalPages: event.data.total_pages,
        progress: 50,
        message: event.data.message || `Generating audio for ${event.data.total_pages} pages...`,
        status: 'generating_audio',
        stage: {
          name: 'Audio Generation',
          detail: `0/${event.data.total_pages} pages`,
          subProgress: 0,
        },
        audioStats: { ...audioStats },
      });
      break;

    case 'audio_progress':
      // Individual page audio generation progress
      const pageStatus = event.data.status; // 'generating', 'completed', 'skipped', 'failed'

      // Update stats based on status
      if (pageStatus === 'completed') {
        audioStats.generated++;
        audioStats.totalDuration += event.data.duration || 0;
      } else if (pageStatus === 'skipped') {
        audioStats.skipped++;
      } else if (pageStatus === 'failed') {
        audioStats.failed++;
      }

      const audioProgress = Math.round((event.data.current_page / event.data.total_pages) * 50) + 50; // 50-100%
      const statusEmoji = pageStatus === 'generating' ? '⏳' :
                          pageStatus === 'completed' ? '✓' :
                          pageStatus === 'skipped' ? '⏭' : '✗';

      callbacks.onProgress?.({
        currentPage: event.data.current_page,
        totalPages: event.data.total_pages,
        progress: audioProgress,
        message: event.data.message || `${statusEmoji} Audio page ${event.data.current_page}/${event.data.total_pages}`,
        status: 'generating_audio',
        stage: {
          name: 'Audio Generation',
          detail: `${event.data.current_page}/${event.data.total_pages} pages`,
          subProgress: Math.round((event.data.current_page / event.data.total_pages) * 100),
        },
        audioStats: {
          generated: audioStats.generated,
          failed: audioStats.failed,
          skipped: audioStats.skipped,
          currentDuration: audioStats.totalDuration,
        },
      });
      break;

    case 'completed':
      // Upload and audio generation complete
      const totalDuration = event.data.total_duration || audioStats.totalDuration;
      const durationStr = totalDuration > 0
        ? `Total duration: ${Math.floor(totalDuration / 60)}m ${Math.round(totalDuration % 60)}s`
        : '';

      callbacks.onProgress?.({
        currentPage: event.data.total_pages,
        totalPages: event.data.total_pages,
        progress: 100,
        message: `Upload complete! ${event.data.audio_generated || audioStats.generated} audio files generated. ${durationStr}`,
        status: 'completed',
        stage: {
          name: 'Completed',
          detail: event.data.message,
        },
        audioStats: {
          generated: event.data.audio_generated || audioStats.generated,
          failed: event.data.audio_failed || audioStats.failed,
          skipped: audioStats.skipped,
          currentDuration: totalDuration,
        },
      });
      callbacks.onCompleted?.(event.data);
      break;

    case 'error':
      callbacks.onProgress?.({
        currentPage: 0,
        totalPages: 0,
        progress: 0,
        message: event.data.error || 'An error occurred',
        status: 'error',
        stage: {
          name: 'Error',
          detail: event.data.details || event.data.error,
        },
      });
      callbacks.onError?.(event.data.error || event.data.details || 'An error occurred during upload');
      break;

    default:
      console.warn('Unknown SSE event type:', event.type);
  }
}
