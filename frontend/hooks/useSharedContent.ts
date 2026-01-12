/**
 * useSharedContent Hook
 * Clean, professional shared content management
 */

import { useState, useEffect, useCallback } from 'react';
import { sharedContentApi } from '@/lib/api-client';
import type { SharedMedia, SharedLink, SharedDocument } from '@/types';

interface UseSharedContentReturn {
  media: SharedMedia[];
  links: SharedLink[];
  documents: SharedDocument[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useSharedContent(sessionId: string | undefined): UseSharedContentReturn {
  const [media, setMedia] = useState<SharedMedia[]>([]);
  const [links, setLinks] = useState<SharedLink[]>([]);
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!sessionId) {
      setMedia([]);
      setLinks([]);
      setDocuments([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [mediaResponse, linksResponse, documentsResponse] = await Promise.all([
        sharedContentApi.getSharedMedia(sessionId),
        sharedContentApi.getSharedLinks(sessionId),
        sharedContentApi.getSharedDocuments(sessionId),
      ]);

      if (mediaResponse.success && mediaResponse.data) {
        const transformedMedia = (mediaResponse.data as any[]).map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
        setMedia(transformedMedia);
      }

      if (linksResponse.success && linksResponse.data) {
        const transformedLinks = (linksResponse.data as any[]).map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
        setLinks(transformedLinks);
      }

      if (documentsResponse.success && documentsResponse.data) {
        const transformedDocs = (documentsResponse.data as any[]).map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }));
        setDocuments(transformedDocs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shared content');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    media,
    links,
    documents,
    loading,
    error,
    refresh: fetchContent,
  };
}
