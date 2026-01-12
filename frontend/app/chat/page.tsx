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
import { useSessions } from '@/hooks/useSessions';
import { useAuth } from '@/contexts/AuthContext';
import type { User, ChatSession } from '@/types';

// Helper function to get other participant
function getOtherParticipant(session: ChatSession, currentUserId: string) {
  if (session.participant1Id === currentUserId) {
    return session.participant2;
  }
  return session.participant1;
}

export default function ChatPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const {
    sessions,
    createSession,
    archiveSession,
    muteSession,
    markUnread,
    deleteSession,
  } = useSessions();
  const router = useRouter();
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
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

  const handleSelectUser = async (selectedUser: User) => {
    if (!user) return;

    // Find existing session with this user
    const existingSession = sessions.find(
      (session) =>
        (session.participant1Id === selectedUser.id || session.participant2Id === selectedUser.id) &&
        (session.participant1Id === user.id || session.participant2Id === user.id)
    );

    if (existingSession) {
      setSelectedSessionId(existingSession.id);
    } else {
      // Create new session
      const newSession = await createSession(selectedUser.id);
      if (newSession) {
        setSelectedSessionId(newSession.id);
      }
    }
  };

  const handleOpenContactInfo = () => {
    setShowContactInfo(true);
  };

  if (authLoading) {
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
        onMarkUnread={async () => {
          await markUnread(contextMenu.sessionId);
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onArchive={async () => {
          await archiveSession(contextMenu.sessionId);
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onMute={async () => {
          await muteSession(contextMenu.sessionId);
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onContactInfo={() => {
          setShowContactInfo(true);
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onExportChat={() => {
          console.log('Export chat:', contextMenu.sessionId);
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onClearChat={async () => {
          // TODO: Implement clear chat
          console.log('Clear chat:', contextMenu.sessionId);
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
        onDeleteChat={async () => {
          await deleteSession(contextMenu.sessionId);
          if (selectedSessionId === contextMenu.sessionId) {
            setSelectedSessionId(undefined);
          }
          setContextMenu({ ...contextMenu, isOpen: false });
        }}
      />

      {/* Contact Info Modal */}
      <ContactInfoModal
        isOpen={showContactInfo}
        user={
          selectedSessionId && user
            ? getOtherParticipant(
                sessions.find((s) => s.id === selectedSessionId)!,
                user.id
              )
            : undefined
        }
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
