// Set VITE_API_BASE_URL environment variable (e.g., http://localhost:8000)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required');
}

export const api = {
  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
    return response.json();
  },
  async processResume(
    file: File,
    jobDescription: string,
    onProgress?: (data: unknown) => void
  ) {
    const formData = new FormData();
    formData.append('resume_file', file);
    formData.append('job_description', jobDescription);

    const response = await fetch(`${API_BASE_URL}/process-resume`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let finalData = null;

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));

            if (data.status === 'completed') {
              finalData = data.data;
            } else if (data.status === 'error') {
              throw new Error(data.message);
            } else if (onProgress) {
              onProgress(data);
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE data:', line);
            // Continue processing other lines instead of failing completely
          }
        }
      }
    }

    return finalData;
  }
};