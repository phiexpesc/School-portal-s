import { useState } from 'react';
import { X, Mail, Send, User, Clock, Check, CheckCheck, MessageSquare } from 'lucide-react';
import type { Message, User as UserType } from '@/types';

interface MessagesProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType;
  messages: Message[];
  users: { id: string; name: string; role: string }[];
  onSendMessage: (recipientId: string, recipientName: string, subject: string, content: string) => void;
  onMarkAsRead: (messageId: string) => void;
}

export function MessagesModal({
  isOpen,
  onClose,
  currentUser,
  messages,
  users,
  onSendMessage,
  onMarkAsRead
}: MessagesProps) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  if (!isOpen) return null;

  const inboxMessages = messages.filter(m => m.recipientId === currentUser.id);
  const sentMessages = messages.filter(m => m.senderId === currentUser.id);
  const unreadCount = inboxMessages.filter(m => !m.read).length;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (recipientId && subject && content) {
      const recipient = users.find(u => u.id === recipientId);
      if (recipient) {
        onSendMessage(recipientId, recipient.name, subject, content);
        setRecipientId('');
        setSubject('');
        setContent('');
        setActiveTab('sent');
      }
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    if (message.recipientId === currentUser.id && !message.read) {
      onMarkAsRead(message.id);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Messages
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
              activeTab === 'inbox'
                ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                : 'bg-white border-[rgba(26,26,26,0.2)]'
            }`}
          >
            <Mail size={16} />
            <span className="text-sm font-bold">Inbox ({inboxMessages.length})</span>
          </button>
          <button
            onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
              activeTab === 'sent'
                ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                : 'bg-white border-[rgba(26,26,26,0.2)]'
            }`}
          >
            <Send size={16} />
            <span className="text-sm font-bold">Sent</span>
          </button>
          <button
            onClick={() => { setActiveTab('compose'); setSelectedMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
              activeTab === 'compose'
                ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                : 'bg-white border-[rgba(26,26,26,0.2)]'
            }`}
          >
            <MessageSquare size={16} />
            <span className="text-sm font-bold">Compose</span>
          </button>
        </div>

        {/* Inbox */}
        {activeTab === 'inbox' && !selectedMessage && (
          <div className="space-y-2">
            {inboxMessages.length === 0 ? (
              <div className="text-center py-8 bg-[var(--bg-primary)] rounded-xl">
                <Mail size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
                <p className="text-sm text-[var(--text-secondary)]">No messages in inbox</p>
              </div>
            ) : (
              inboxMessages.slice().reverse().map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className={`w-full card p-3 text-left transition-all hover:shadow-md ${
                    !message.read ? 'bg-[var(--card-mint)] border-[rgba(26,26,26,0.85)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{message.senderName}</p>
                        <p className={`text-xs ${!message.read ? 'font-bold' : 'text-[var(--text-secondary)]'}`}>
                          {message.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <Clock size={12} />
                      <span className="text-[10px]">{formatDate(message.timestamp)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Sent */}
        {activeTab === 'sent' && !selectedMessage && (
          <div className="space-y-2">
            {sentMessages.length === 0 ? (
              <div className="text-center py-8 bg-[var(--bg-primary)] rounded-xl">
                <Send size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
                <p className="text-sm text-[var(--text-secondary)]">No sent messages</p>
              </div>
            ) : (
              sentMessages.slice().reverse().map((message) => (
                <button
                  key={message.id}
                  onClick={() => handleMessageClick(message)}
                  className="w-full card p-3 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--card-lavender)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">To: {message.recipientName}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{message.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                      <Clock size={12} />
                      <span className="text-[10px]">{formatDate(message.timestamp)}</span>
                      {message.read ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Compose */}
        {activeTab === 'compose' && (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="micro-label block mb-1 text-xs">To</label>
              <select
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                className="input-field text-sm"
                required
              >
                <option value="">Select recipient...</option>
                {users.filter(u => u.id !== currentUser.id).map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="micro-label block mb-1 text-xs">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field text-sm"
                placeholder="Enter subject..."
                required
              />
            </div>
            <div>
              <label className="micro-label block mb-1 text-xs">Message</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field rounded-2xl py-3 text-sm"
                rows={5}
                placeholder="Type your message..."
                required
              />
            </div>
            <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
              <Send size={16} />
              Send Message
            </button>
          </form>
        )}

        {/* Message Detail */}
        {selectedMessage && (
          <div className="card p-4">
            <button
              onClick={() => setSelectedMessage(null)}
              className="mb-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ← Back to {activeTab}
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] border-[2px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <p className="font-bold">
                  {activeTab === 'inbox' ? selectedMessage.senderName : `To: ${selectedMessage.recipientName}`}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">{formatDate(selectedMessage.timestamp)}</p>
              </div>
            </div>
            <h4 className="font-bold text-lg mb-3">{selectedMessage.subject}</h4>
            <div className="bg-[var(--bg-primary)] rounded-xl p-4">
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
