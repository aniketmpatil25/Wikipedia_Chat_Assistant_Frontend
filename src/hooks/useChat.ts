'use client';

import { useState, useEffect, useCallback } from 'react';
import { Message, Conversation, Source } from '@/types';
import { sendChatMessageStream } from '@/lib/api';

const STORAGE_KEY = 'wiki_chat_conversations_v1';
const ACTIVE_CONV_KEY = 'wiki_chat_active_id';

const generateUniqueId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved conversations on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const activeId = localStorage.getItem(ACTIVE_CONV_KEY);
      if (saved) {
        const parsed: Conversation[] = JSON.parse(saved);
        setConversations(parsed);
        if (activeId && parsed.some((c) => c.id === activeId)) {
          setActiveConversationId(activeId);
        } else if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
    }
  }, []);

  // Helper to persist conversations to localStorage without triggering state loop
  const persistToStorage = useCallback((updated: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save conversations to localStorage:', e);
    }
  }, []);

  // Create new conversation
  const createNewConversation = useCallback(() => {
    const newId = generateUniqueId('conv');
    const newConv: Conversation = {
      id: newId,
      title: 'New Conversation',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setConversations((prev) => {
      const updated = [newConv, ...prev];
      persistToStorage(updated);
      try {
        localStorage.setItem(ACTIVE_CONV_KEY, newId);
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setActiveConversationId(newId);
    setError(null);
    return newId;
  }, [persistToStorage]);

  // Select conversation
  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    try {
      localStorage.setItem(ACTIVE_CONV_KEY, id);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Delete conversation
  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      persistToStorage(filtered);
      if (activeConversationId === id) {
        const nextActive = filtered.length > 0 ? filtered[0].id : null;
        setActiveConversationId(nextActive);
        if (nextActive) {
          try { localStorage.setItem(ACTIVE_CONV_KEY, nextActive); } catch (e) {}
        } else {
          try { localStorage.removeItem(ACTIVE_CONV_KEY); } catch (e) {}
        }
      }
      return filtered;
    });
  }, [activeConversationId, persistToStorage]);

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === activeConversationId) || null;

  // Send message
  const sendMessage = useCallback(
    async (queryText: string, language: string = 'en') => {
      if (!queryText.trim() || isLoading) return;

      let convId = activeConversationId;
      let isFirstMessageInConv = false;

      if (!convId || !conversations.some((c) => c.id === convId)) {
        convId = createNewConversation();
        isFirstMessageInConv = true;
      }

      const userMsgId = generateUniqueId('user');
      const userMessage: Message = {
        id: userMsgId,
        role: 'user',
        content: queryText.trim(),
        timestamp: new Date().toISOString(),
      };

      const botMsgId = generateUniqueId('bot');
      const botPlaceholderMessage: Message = {
        id: botMsgId,
        role: 'assistant',
        content: '',
        sources: [],
        timestamp: new Date().toISOString(),
        isStreaming: true,
      };

      // Add user message & placeholder bot message
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === convId) {
            const updatedTitle = isFirstMessageInConv || c.messages.length === 0
              ? (queryText.trim().length > 30 ? queryText.trim().substring(0, 30) + '...' : queryText.trim())
              : c.title;

            return {
              ...c,
              title: updatedTitle,
              messages: [...c.messages, userMessage, botPlaceholderMessage],
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        });
        persistToStorage(updated);
        return updated;
      });

      setIsLoading(true);
      setError(null);

      // Get history up to this point
      const currentConv = conversations.find((c) => c.id === convId);
      const history = currentConv ? currentConv.messages : [];

      let accumulatedToken = '';
      let receivedSources: Source[] = [];

      await sendChatMessageStream(queryText, history, convId, {
        onToken: (token) => {
          accumulatedToken += token;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === convId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === botMsgId
                      ? { ...m, content: accumulatedToken }
                      : m
                  ),
                };
              }
              return c;
            })
          );
        },
        onSources: (sources) => {
          receivedSources = sources;
          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === convId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === botMsgId
                      ? { ...m, sources }
                      : m
                  ),
                };
              }
              return c;
            })
          );
        },
        onComplete: () => {
          setIsLoading(false);
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id === convId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === botMsgId
                      ? { ...m, isStreaming: false, sources: receivedSources }
                      : m
                  ),
                };
              }
              return c;
            });
            persistToStorage(updated);
            return updated;
          });
        },
        onError: (errMsg) => {
          setIsLoading(false);
          setError(errMsg);
          setConversations((prev) => {
            const updated = prev.map((c) => {
              if (c.id === convId) {
                return {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === botMsgId
                      ? {
                          ...m,
                          content: m.content || `⚠️ Error: ${errMsg}`,
                          isStreaming: false,
                        }
                      : m
                  ),
                };
              }
              return c;
            });
            persistToStorage(updated);
            return updated;
          });
        },
      }, language);
    },
    [activeConversationId, conversations, isLoading, createNewConversation, persistToStorage]
  );

  return {
    conversations,
    currentConversation,
    activeConversationId,
    isLoading,
    error,
    createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  };
}
