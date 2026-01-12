/**
 * Contact Info Modal
 * Matches Figma design exactly - 6th screen (node 0:2750)
 * Displays user profile with shared media organized by month
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { tokens } from '@/lib/design-tokens';
import { useSharedContent } from '@/hooks/useSharedContent';
import { useMessages } from '@/hooks/useMessages';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { sharedContentApi } from '@/lib/api-client';
import { detectLinks } from '@/utils/link';
import {
  groupMediaByMonth,
  groupLinksByMonth,
  groupDocumentsByMonth,
  formatFileSize,
} from '@/data/mockData';
import type { User } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Icon from '@/components/ui/Icon';
import Image from 'next/image';

interface ContactInfoModalProps {
  isOpen: boolean;
  user: User | undefined;
  sessionId: string | undefined;
  onClose: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
}

type TabType = 'media' | 'link' | 'docs';

export default function ContactInfoModal({
  isOpen,
  user,
  sessionId,
  onClose,
  onAudioCall,
  onVideoCall,
}: ContactInfoModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('media');
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { media, links, documents, loading, refresh: refreshSharedContent } = useSharedContent(sessionId);
  const { messages } = useMessages(sessionId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll on mobile when modal is open
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      // Restore body scroll when modal closes
      if (isMobile) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
      }
    };
  }, [isOpen, onClose, isMobile]);

  // Extract and save links from existing messages when modal opens
  useEffect(() => {
    if (!isOpen || !sessionId || messages.length === 0) return;

    const extractAndSaveLinks = async () => {
      const existingLinkUrls = new Set(links.map(link => link.url));
      const linksToSave: string[] = [];

      // Extract links from all TEXT messages
      messages.forEach((message) => {
        if (message.type === 'TEXT' && message.content) {
          const detectedLinks = detectLinks(message.content);
          detectedLinks.forEach((link) => {
            if (!existingLinkUrls.has(link.url)) {
              linksToSave.push(link.url);
              existingLinkUrls.add(link.url); // Prevent duplicates in this batch
            }
          });
        }
      });

      // Save all new links
      if (linksToSave.length > 0) {
        try {
          await Promise.all(
            linksToSave.map((url) =>
              sharedContentApi.shareLink({
                url,
                title: url,
                description: '',
                sessionId,
              }).catch((err) => {
                console.error('Failed to save link:', err);
                return null;
              })
            )
          );
          // Refresh shared content to show new links
          await refreshSharedContent();
        } catch (error) {
          console.error('Error extracting links from messages:', error);
        }
      }
    };

    extractAndSaveLinks();
  }, [isOpen, sessionId, messages, links, refreshSharedContent]);

  if (!isOpen || !user || !sessionId) return null;

  // Use shared content from hook

  const mediaByMonth = groupMediaByMonth(media);
  const linksByMonth = groupLinksByMonth(links);
  const documentsByMonth = groupDocumentsByMonth(documents);

  // Helper function to get document icon color
  const getDocIconColor = (type: string): string => {
    switch (type) {
      case 'pdf':
        return '#ef4444'; // red
      case 'fig':
        return '#a855f7'; // purple
      case 'ai':
        return '#f97316'; // orange
      case 'psd':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          zIndex: 999,
        }}
      />

      {/* Contact Info Panel - Responsive: Full screen on mobile, 450px on desktop */}
      <div
        ref={modalRef}
        style={{
          position: 'fixed',
          ...(isMobile
            ? {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                margin: 0,
                borderRadius: 0,
                transform: 'none',
                padding: tokens.spacing[4], // 16px on mobile
              }
            : {
                top: '12px',
                right: '12px',
                width: '450px',
                height: '1000px',
                maxHeight: 'calc(100vh - 24px)',
                borderRadius: tokens.borderRadius['2xl'], // 24px
                padding: tokens.spacing[6], // 24px on desktop
              }),
          backgroundColor: tokens.colors.surface.default,
          boxShadow: isMobile ? 'none' : '0px 4px 32px 0px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? tokens.spacing[4] : tokens.spacing[6], // 16px on mobile, 24px on desktop
          zIndex: 1000,
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {/* Header: Title + Close Button */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <h2
            style={{
              flex: 1,
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: '28px',
              color: tokens.colors.text.neutral.main,
              fontFamily: tokens.typography.fontFamily.sans.join(', '),
            }}
          >
            Contact Info
          </h2>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <Icon name="x" size={24} color={tokens.colors.text.neutral.sub} />
          </button>
        </div>

        {/* Profile Section: Avatar + Name + Email */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? tokens.spacing[3] : tokens.spacing[4], // 12px on mobile, 16px on desktop
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Large Avatar - 72px */}
          <Avatar
            src={user.picture}
            name={user.name}
            size="lg"
          />
          
          {/* Name + Email */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <p
              style={{
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '24px',
                letterSpacing: '-0.176px',
                color: tokens.colors.text.neutral.main,
                fontFamily: tokens.typography.fontFamily.sans.join(', '),
                textAlign: 'center',
              }}
            >
              {user.name}
            </p>
            <p
              style={{
                fontSize: '12px',
                fontWeight: 400,
                lineHeight: '16px',
                color: tokens.colors.text.placeholder,
                fontFamily: tokens.typography.fontFamily.sans.join(', '),
              }}
            >
              {user.email}
            </p>
          </div>
        </div>

        {/* Action Buttons: Audio + Video */}
        <div
          style={{
            display: 'flex',
            gap: tokens.spacing[4], // 16px
            width: '100%',
          }}
        >
          {/* Audio Button */}
          <button
            onClick={onAudioCall}
            style={{
              flex: 1,
              height: '32px',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: tokens.colors.surface.default,
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: tokens.borderRadius.base, // 8px
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.surface.default;
            }}
          >
            <Icon name="phone" size={18} color={tokens.colors.text.neutral.main} />
            <span
              style={{
                ...tokens.typography.styles.labelSmall,
                color: tokens.colors.text.neutral.main,
              }}
            >
              Audio
            </span>
          </button>

          {/* Video Button */}
          <button
            onClick={onVideoCall}
            style={{
              flex: 1,
              height: '32px',
              display: 'flex',
              gap: '6px',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              backgroundColor: tokens.colors.surface.default,
              border: `1px solid ${tokens.colors.border.primary}`,
              borderRadius: tokens.borderRadius.base, // 8px
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.colors.surface.default;
            }}
          >
            <Icon name="video" size={18} color={tokens.colors.text.neutral.main} />
            <span
              style={{
                ...tokens.typography.styles.labelSmall,
                color: tokens.colors.text.neutral.main,
              }}
            >
              Video
            </span>
          </button>
        </div>

          {/* Content Container: Tabs + Content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '8px' : '12px',
              minHeight: 0,
              width: '100%',
              overflow: 'hidden',
            }}
          >
          {/* Tab Switch Group */}
          <div
            style={{
              backgroundColor: tokens.colors.background.primary,
              padding: '2px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'clip',
            }}
          >
            {/* Media Tab */}
            <button
              onClick={() => setActiveTab('media')}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'media' ? 'white' : 'transparent',
                boxShadow: activeTab === 'media' ? '0px 0px 16px 0px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  ...tokens.typography.styles.labelSmall,
                  color: activeTab === 'media' 
                    ? tokens.colors.text.neutral.main 
                    : tokens.colors.text.placeholder,
                  textAlign: 'center',
                }}
              >
                Media
              </span>
            </button>

            {/* Link Tab */}
            <button
              onClick={() => setActiveTab('link')}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'link' ? 'white' : 'transparent',
                boxShadow: activeTab === 'link' ? '0px 0px 16px 0px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  ...tokens.typography.styles.labelSmall,
                  color: activeTab === 'link' 
                    ? tokens.colors.text.neutral.main 
                    : tokens.colors.text.placeholder,
                  textAlign: 'center',
                }}
              >
                Link
              </span>
            </button>

            {/* Docs Tab */}
            <button
              onClick={() => setActiveTab('docs')}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 10px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'docs' ? 'white' : 'transparent',
                boxShadow: activeTab === 'docs' ? '0px 0px 16px 0px rgba(0, 0, 0, 0.06)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span
                style={{
                  ...tokens.typography.styles.labelSmall,
                  color: activeTab === 'docs' 
                    ? tokens.colors.text.neutral.main 
                    : tokens.colors.text.placeholder,
                  textAlign: 'center',
                }}
              >
                Docs
              </span>
            </button>
          </div>

          {/* Content Area - Scrollable */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              overflowY: 'auto',
              overflowX: 'hidden',
              minHeight: 0,
              width: '100%',
              borderRadius: '0 0 12px 12px',
            }}
          >
            {/* Media Tab Content */}
            {activeTab === 'media' && (
              <>
                {mediaByMonth.length > 0 ? (
                  mediaByMonth.map(({ month, items }) => (
                    <div
                      key={month}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        width: '100%',
                      }}
                    >
                      {/* Month Header */}
                      <div
                        style={{
                          backgroundColor: tokens.colors.background.tertiary,
                          padding: '8px 12px',
                          borderRadius: tokens.borderRadius.base, // 8px
                          width: '100%',
                        }}
                      >
                        <p
                          style={{
                            ...tokens.typography.styles.labelXSmall,
                            color: tokens.colors.text.placeholder,
                          }}
                        >
                          {month}
                        </p>
                      </div>

                      {/* Media Grid - Responsive: 2 columns on mobile, 4 on desktop */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 97.5px)',
                          gap: '4px',
                          width: '100%',
                        }}
                      >
                        {items.map((media) => (
                          <div
                            key={media.id}
                            style={{
                              position: 'relative',
                              width: isMobile ? '100%' : '97.5px',
                              height: isMobile ? 'auto' : '97.5px',
                              aspectRatio: '1',
                              borderRadius: tokens.borderRadius.base, // 8px
                              overflow: 'hidden',
                              backgroundColor: '#d9d9d9',
                              cursor: 'pointer',
                            }}
                          >
                            <Image
                              src={media.thumbnailUrl}
                              alt=""
                              fill
                              style={{
                                objectFit: 'cover',
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: tokens.spacing[6],
                    }}
                  >
                    <p
                      style={{
                        ...tokens.typography.styles.paragraphSmall,
                        color: tokens.colors.text.placeholder,
                      }}
                    >
                      No shared media yet
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Link Tab Content */}
            {activeTab === 'link' && (
              <>
                {linksByMonth.length > 0 ? (
                  linksByMonth.map(({ month, items }) => (
                    <div
                      key={month}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        width: '100%',
                      }}
                    >
                      {/* Month Header */}
                      <div
                        style={{
                          backgroundColor: tokens.colors.background.tertiary,
                          padding: '8px 12px',
                          borderRadius: tokens.borderRadius.base,
                          width: '100%',
                        }}
                      >
                        <p
                          style={{
                            ...tokens.typography.styles.labelXSmall,
                            color: tokens.colors.text.placeholder,
                          }}
                        >
                          {month}
                        </p>
                      </div>

                      {/* Links List */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0px',
                          width: '100%',
                        }}
                      >
                        {items.map((link) => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'flex',
                              gap: '12px',
                              padding: '12px 8px',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              borderRadius: tokens.borderRadius.base,
                              transition: 'background-color 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {/* Favicon */}
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: tokens.borderRadius.base,
                                overflow: 'hidden',
                                backgroundColor: tokens.colors.surface.weak,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {link.favicon && link.favicon.trim() !== '' ? (
                                <Image
                                  src={link.favicon}
                                  alt={link.title || 'Link'}
                                  width={48}
                                  height={48}
                                  style={{
                                    objectFit: 'contain',
                                  }}
                                />
                              ) : (
                                <Icon
                                  name="link"
                                  size={24}
                                  color={tokens.colors.icon.secondary}
                                />
                              )}
                            </div>

                            {/* Link Info */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  lineHeight: '20px',
                                  color: tokens.colors.text.neutral.main,
                                  fontFamily: tokens.typography.fontFamily.sans.join(', '),
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {link.url}
                              </p>
                              <p
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 400,
                                  lineHeight: '16px',
                                  color: tokens.colors.text.placeholder,
                                  fontFamily: tokens.typography.fontFamily.sans.join(', '),
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                }}
                              >
                                {link.description}
                              </p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: tokens.spacing[6],
                    }}
                  >
                    <p
                      style={{
                        ...tokens.typography.styles.paragraphSmall,
                        color: tokens.colors.text.placeholder,
                      }}
                    >
                      No shared links yet
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Docs Tab Content */}
            {activeTab === 'docs' && (
              <>
                {documentsByMonth.length > 0 ? (
                  documentsByMonth.map(({ month, items }) => (
                    <div
                      key={month}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        width: '100%',
                      }}
                    >
                      {/* Month Header */}
                      <div
                        style={{
                          backgroundColor: tokens.colors.background.tertiary,
                          padding: '8px 12px',
                          borderRadius: tokens.borderRadius.base,
                          width: '100%',
                        }}
                      >
                        <p
                          style={{
                            ...tokens.typography.styles.labelXSmall,
                            color: tokens.colors.text.placeholder,
                          }}
                        >
                          {month}
                        </p>
                      </div>

                      {/* Documents List */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0px',
                          width: '100%',
                        }}
                      >
                        {items.map((doc) => (
                          <button
                            key={doc.id}
                            style={{
                              display: 'flex',
                              gap: '12px',
                              padding: '12px 8px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              borderRadius: tokens.borderRadius.base,
                              transition: 'background-color 0.2s ease',
                              textAlign: 'left',
                              width: '100%',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = tokens.colors.surface.weak;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {/* File Icon */}
                            <div
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: tokens.borderRadius.base,
                                backgroundColor: getDocIconColor(doc.type),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: 'white',
                                  textTransform: 'uppercase',
                                  fontFamily: tokens.typography.fontFamily.sans.join(', '),
                                }}
                              >
                                {doc.type}
                              </span>
                            </div>

                            {/* Document Info */}
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '4px',
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  lineHeight: '20px',
                                  color: tokens.colors.text.neutral.main,
                                  fontFamily: tokens.typography.fontFamily.sans.join(', '),
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {doc.name}
                              </p>
                              <p
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 400,
                                  lineHeight: '16px',
                                  color: tokens.colors.text.placeholder,
                                  fontFamily: tokens.typography.fontFamily.sans.join(', '),
                                }}
                              >
                                {doc.pages ? `${doc.pages} pages • ` : ''}{formatFileSize(doc.size)} • {doc.type}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: tokens.spacing[6],
                    }}
                  >
                    <p
                      style={{
                        ...tokens.typography.styles.paragraphSmall,
                        color: tokens.colors.text.placeholder,
                      }}
                    >
                      No shared documents yet
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
