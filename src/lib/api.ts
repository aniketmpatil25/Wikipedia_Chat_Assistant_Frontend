import { Message, Source, CollectionStats, CrawlResponse, WikiArticleSummary } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatStreamCallbacks {
  onToken: (token: string) => void;
  onSources: (sources: Source[]) => void;
  onComplete: (conversationId: string) => void;
  onError: (error: string) => void;
}

export async function sendChatMessageStream(
  query: string,
  history: Message[],
  conversationId: string | null,
  callbacks: ChatStreamCallbacks
): Promise<void> {
  try {
    const formattedHistory = history.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        history: formattedHistory,
        conversation_id: conversationId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok' }));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported by response');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.replace('data: ', '');
          try {
            const data = JSON.parse(jsonStr);
            if (data.type === 'token' && data.content) {
              callbacks.onToken(data.content);
            } else if (data.type === 'sources' && data.sources) {
              callbacks.onSources(data.sources);
            } else if (data.type === 'done') {
              callbacks.onComplete(data.conversation_id || conversationId || '');
            }
          } catch (err) {
            console.error('Failed to parse SSE line:', jsonStr, err);
          }
        }
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to communicate with backend';
    callbacks.onError(errorMessage);
  }
}

export async function fetchCollectionStats(): Promise<CollectionStats | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/collections/stats`);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error('Error fetching collection stats:', e);
    return null;
  }
}

export async function crawlTopics(topics: string[], maxArticles = 5): Promise<CrawlResponse> {
  const res = await fetch(`${API_BASE_URL}/api/crawl`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topics, max_articles: maxArticles, language: 'en' }),
  });
  if (!res.ok) {
    throw new Error('Failed to start topic crawl');
  }
  return await res.json();
}

export async function searchWikipedia(query: string): Promise<WikiArticleSummary[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    console.error('Error searching wikipedia:', e);
    return [];
  }
}
