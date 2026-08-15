export type MessageRole = 'user' | 'assistant' | 'system';

export interface Source {
  title: string;
  url: string;
  section?: string;
  relevance_score: number;
  snippet?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: Source[];
  timestamp: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface WikiArticleSummary {
  title: string;
  url: string;
  snippet: string;
  page_id: number;
}

export interface CollectionStats {
  total_chunks: number;
  total_articles: number;
  collection_name: string;
}

export interface CrawlResponse {
  articles_crawled: number;
  chunks_stored: number;
  topics_processed: string[];
  errors: string[];
}
