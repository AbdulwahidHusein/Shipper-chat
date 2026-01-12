/**
 * Main Chat Page
 * Combines Sidebar, TopBar, MessageList, and ChatWindow
 * Matches Figma design layout exactly
 */

'use client';

import { useState } from 'react';
import TopBar from '@/components/chat/TopBar';
import MessageList from '@/components/chat/MessageList';
import ChatWindow from '@/components/chat/ChatWindow';
import NewMessageModal from '@/components/modals/NewMessageModal';
import ChatContextMenu from '@/components/modals/ChatContextMenu';
import { tokens } from '@/lib/design-tokens';
import { mockUsers, mockSessions } from '@/data/mockData';
import type { User } from '@/types';

export default function ChatPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>('session1');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    sessionId: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    sessionId: '',
  });

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

  return (
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
          console.log('Contact info:', contextMenu.sessionId);
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
    </div>
  );
}
