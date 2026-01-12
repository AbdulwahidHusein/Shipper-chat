/**
 * Shared Content Service
 * Clean, professional shared media/links/documents management
 */

import prisma from '../config/database';
import { MediaType, DocumentType } from '@prisma/client';

// ============================================
// SHARED MEDIA
// ============================================

export interface CreateSharedMediaData {
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  sessionId: string;
  uploadedById: string;
}

export const findSharedMediaBySession = async (sessionId: string) => {
  return prisma.sharedMedia.findMany({
    where: { sessionId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const createSharedMedia = async (data: CreateSharedMediaData) => {
  return prisma.sharedMedia.create({
    data,
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });
};

// ============================================
// SHARED LINKS
// ============================================

export interface CreateSharedLinkData {
  url: string;
  title: string;
  description?: string;
  favicon?: string;
  sessionId: string;
  sharedById: string;
}

export const findSharedLinksBySession = async (sessionId: string) => {
  return prisma.sharedLink.findMany({
    where: { sessionId },
    include: {
      sharedBy: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const createSharedLink = async (data: CreateSharedLinkData) => {
  return prisma.sharedLink.create({
    data,
    include: {
      sharedBy: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });
};

// ============================================
// SHARED DOCUMENTS
// ============================================

export interface CreateSharedDocumentData {
  name: string;
  type: DocumentType;
  size: number;
  pages?: number;
  url?: string;
  sessionId: string;
  uploadedById: string;
}

export const findSharedDocumentsBySession = async (sessionId: string) => {
  return prisma.sharedDocument.findMany({
    where: { sessionId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const createSharedDocument = async (data: CreateSharedDocumentData) => {
  return prisma.sharedDocument.create({
    data,
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
          picture: true,
        },
      },
    },
  });
};
