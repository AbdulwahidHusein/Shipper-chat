/**
 * ChatWindow Component
 * Refactored - Clean, modular, and maintainable
 */

'use client';

// Add typing animation styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes typing {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.7;
      }
      30% {
        transform: translateY(-10px);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

import { useState, useEffect, useRef } from 'react';
import { tokens } from '@/lib/design-tokens';
import { useMessages } from '@/hooks/useMessages';
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { useReadDetection } from '@/hooks/useReadDetection';
import { useFileUpload } from '@/hooks/useFileUpload';
import { messageApi, sharedContentApi } from '@/lib/api-client';
import { detectLinks } from '@/utils/link';
import type { ChatSession } from '@/types';
import ChatHeader from './ChatHeader';
import MessageArea from './MessageArea';
import MessageInput from './MessageInput';
import FilePreview from './FilePreview';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Helper function to get other participant
function getOtherParticipant(session: ChatSession, currentUserId: string) {
  if (session.participant1Id === currentUserId) {
    return session.participant2;
  }
  return session.participant1;
}

interface ChatWindowProps {
  sessionId?: string;
  onOpenContextMenu?: (sessionId: string, position: { x: number; y: number }) => void;
  onOpenContactInfo?: () => void;
}

export default function ChatWindow({ sessionId, onOpenContextMenu, onOpenContactInfo }: ChatWindowProps) {
  const { user } = useAuth();
  const { sessions } = useSessions(true); // Include archived sessions
  const { messages, loading, sendMessage: sendMessageApi, markAllRead, markMessageAsRead } = useMessages(sessionId);
  const { isConnected, emit } = useSocket();
  const [messageInput, setMessageInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Typing indicator
  const { typingUsers } = useTypingIndicator(sessionId, user?.id);

  // Read detection
  useReadDetection({
    messages,
    sessionId,
    currentUserId: user?.id,
    messagesContainerRef,
    messageRefs,
    markMessageAsRead,
  });

  // File upload
  const {
    uploading,
    uploadProgress,
    previewFile,
    fileInputRef,
    handleFileSelect,
    clearPreview,
    triggerFileInput,
  } = useFileUpload(sessionId, async (url, type) => {
    await sendMessageApi(url, type);
    setMessageInput('');
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Mark messages as read when session is selected
  useEffect(() => {
    if (sessionId) {
      markAllRead();
    }
  }, [sessionId, markAllRead]);

  // Typing detection on input change - handled in useTypingIndicator hook
  // This effect emits typing events when user types
  useEffect(() => {
    if (!sessionId || !isConnected) return;

    if (!messageInput.trim()) {
      emit('typing:stop', { sessionId });
      return;
    }

    emit('typing:start', { sessionId });

    const timeout = setTimeout(() => {
      if (isConnected) {
        emit('typing:stop', { sessionId });
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [messageInput, sessionId, isConnected, emit]);

  // Notifications setup
  useEffect(() => {
    if (!user) return;

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [user]);

  // Early returns
  if (!sessionId) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.colors.surface.default,
          borderRadius: tokens.borderRadius['2xl'],
          height: '100%',
        }}
      >
        <p
          style={{
            ...tokens.typography.styles.paragraphSmall,
            color: tokens.colors.text.placeholder,
          }}
        >
          Select a conversation to start chatting
        </p>
      </div>
    );
  }

  const session = sessions.find((s) => s.id === sessionId);
  if (!session || !user) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: tokens.colors.surface.default,
          borderRadius: tokens.borderRadius['2xl'],
        }}
      >
        <LoadingSpinner size="md" message="Loading conversation..." />
      </div>
    );
  }

  const otherParticipant = getOtherParticipant(session, user.id);

  // Handlers
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !sessionId) return;

    if (isConnected) {
      emit('typing:stop', { sessionId });
    }

    const content = messageInput.trim();
    setMessageInput('');

    // Send message immediately (don't wait for link saving)
    await sendMessageApi(content);

    // Save links in the background (non-blocking)
    const links = detectLinks(content);
    if (links.length > 0 && sessionId) {
      // Save all links in parallel (non-blocking)
      Promise.all(
        links.map((link) =>
          sharedContentApi.shareLink({
            url: link.url,
            title: link.url,
            description: '',
            sessionId,
          }).catch((error) => {
            // Silently fail - link saving is background operation
            console.error('Failed to save link:', error);
            return null;
          })
        )
      ).catch(() => {
        // Ignore errors in background link saving
      });
    }
  };

  const handleEditMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditContent(currentContent);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !editContent.trim()) return;

    try {
      await messageApi.editMessage(editingMessageId, { content: editContent.trim() });
      setEditingMessageId(null);
      setEditContent('');
    } catch (error) {
      alert('Failed to edit message');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await messageApi.deleteMessage(messageId);
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  // Convert typing users map to array
  const typingUsersArray: string[] = Array.from(typingUsers.values());

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        backgroundColor: tokens.colors.surface.default,
        borderRadius: tokens.borderRadius['2xl'],
        padding: tokens.spacing[3],
        overflow: 'hidden',
      }}
    >
      {/* Chat Header */}
      <ChatHeader
        participant={otherParticipant}
        sessionId={sessionId}
        isArchived={session.isArchived || false}
        onOpenContactInfo={onOpenContactInfo}
        onOpenContextMenu={onOpenContextMenu}
      />

      {/* Message Area */}
      <MessageArea
        messages={messages}
        loading={loading}
        currentUserId={user.id}
        editingMessageId={editingMessageId}
        editContent={editContent}
        typingUsers={typingUsersArray}
        onEdit={handleEditMessage}
        onSaveEdit={handleSaveEdit}
        onCancelEdit={handleCancelEdit}
        onEditContentChange={setEditContent}
        onDelete={handleDeleteMessage}
        messageRefs={messageRefs}
        messagesContainerRef={messagesContainerRef}
      />

      {/* File Preview */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onRemove={clearPreview}
        />
      )}

      {/* Input Area */}
      <div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <MessageInput
          value={messageInput}
          onChange={setMessageInput}
          onSend={handleSendMessage}
          onAttach={triggerFileInput}
          uploading={uploading}
          hasPreview={!!previewFile}
        />
      </div>
    </div>
  );
}
