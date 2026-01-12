/**
 * Main Chat Page
 * Combines Sidebar, TopBar, MessageList, and ChatWindow
 * Matches Figma design layout exactly
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TopBar from '@/components/chat/TopBar';
import MessageList from '@/components/chat/MessageList';
import ChatWindow from '@/components/chat/ChatWindow';
import NewMessageModal from '@/components/modals/NewMessageModal';
import ChatContextMenu from '@/components/modals/ChatContextMenu';
import ContactInfoModal from '@/components/modals/ContactInfoModal';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { tokens } from '@/lib/design-tokens';
import { mockUsers, mockSessions, getOtherParticipant } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';

export default function ChatPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>('session1');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    sessionId: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    sessionId: '',
  });

  useEffect(() => {
    // Handle OAuth callback success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      // Refresh user data after successful auth
      refreshUser();
      window.history.replaceState({}, '', '/chat');
    }
  }, [refreshUser]);

  const handleOpenContextMenu = (sessionId: string, position: { x: number; y: number }) => {
    setContextMenu({
      isOpen: true,
      position,
      sessionId,
    });
  };

  const handleSelectUser = (user: User) => {
    // Find or create a session with this user
    const existingSession = mockSessions.find(
      (session) =>
        (session.participant1Id === user.id || session.participant2Id === user.id) &&
        (session.participant1Id === '8' || session.participant2Id === '8') // current user id
    );
    
    if (existingSession) {
      setSelectedSessionId(existingSession.id);
    } else {
      // For now, just select the first session
      // In real app, we'd create a new session
      setSelectedSessionId('session1');
    }
  };

  const handleOpenContactInfo = () => {
    setShowContactInfo(true);
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          width: '100vw',
          backgroundColor: tokens.colors.background.primary,
        }}
      >
        <LoadingSpinner size="lg" message="Loading..." />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: tokens.colors.background.primary,
        overflow: 'hidden',
        padding: tokens.spacing[3], // 12px
        gap: tokens.spacing[3], // 12px
      }}
    >
      {/* Top Bar */}
      <TopBar />

      {/* Message List and Chat Window */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: tokens.spacing[3], // 12px
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Message List */}
        <MessageList
          selectedSessionId={selectedSessionId}
          onSelectSession={setSelectedSessionId}
          onNewMessage={() => setShowNewMessageModal(true)}
          onOpenContextMenu={handleOpenContextMenu}
        />

        {/* Chat Window */}
        <ChatWindow 
          sessionId={selectedSessionId}
          onOpenContextMenu={handleOpenContextMenu}
          onOpenContactInfo={handleOpenContactInfo}
        />
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onSelectUser={handleSelectUser}
      />

      {/* Context Menu */}
      <ChatContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        onMarkUnread={() => {
          console.log('Mark as unread:', contextMenu.sessionId);
        }}
        onArchive={() => {
          console.log('Archive:', contextMenu.sessionId);
        }}
        onMute={() => {
          console.log('Mute:', contextMenu.sessionId);
        }}
        onContactInfo={() => {
          setShowContactInfo(true);
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onExportChat={() => {
          console.log('Export chat:', contextMenu.sessionId);
        }}
        onClearChat={() => {
          console.log('Clear chat:', contextMenu.sessionId);
        }}
        onDeleteChat={() => {
          console.log('Delete chat:', contextMenu.sessionId);
        }}
      />

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={showContactInfo}
        user={selectedSessionId ? getOtherParticipant(
          mockSessions.find((s) => s.id === selectedSessionId)!,
          '8'
        ) : undefined}
        sessionId={selectedSessionId}
        onClose={() => setShowContactInfo(false)}
        onAudioCall={() => {
          console.log('Audio call');
        }}
        onVideoCall={() => {
          console.log('Video call');
        }}
      />
      </div>
    </ProtectedRoute>
  );
}
