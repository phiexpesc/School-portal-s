import { useState, useEffect } from 'react';
import { X, Send, Inbox, Send as SendIcon, MessageSquare, Loader2 } from 'lucide-react';
import type { Message, User } from '@/types';

interface MessagesProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  users: User[];
  getUserMessages: (userId: string) => Promise<Message[]>;
  getUnreadMessageCount: (userId: string) => Promise<number>;
  onSendMessage: (recipientId: string, recipientName: string, subject: string, content: string) => Promise<void>;
  onMarkAsRead: (messageId: string) => Promise<void>;
}

export function Messages({ 
  isOpen, 
  onClose, 
  currentUser,
  users,
  getUserMessages,
  getUnreadMessageCount,
  onSendMessage,
  onMarkAsRead
}: MessagesProps) {
  const [activeTab, setActiveTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load messages from Firebase
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const [data, count] = await Promise.all([
          getUserMessages(currentUser.id),
          getUnreadMessageCount(currentUser.id)
        ]);
        setMessages(data);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, currentUser.id, getUserMessages, getUnreadMessageCount]);

  if (!isOpen) return null;

  const inboxMessages = messages.filter(m => m.recipientId === currentUser.id);
  const sentMessages = messages.filter(m => m.senderId === currentUser.id);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientId || !subject || !content) return;

    setIsSending(true);
    try {
      const recipient = users.find(u => u.id === recipientId);
      if (recipient) {
        await onSendMessage(recipientId, recipient.name, subject, content);
        // Refresh messages
        const data = await getUserMessages(currentUser.id);
        setMessages(data);
        setActiveTab('sent');
        setRecipientId('');
        setSubject('');
        setContent('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    if (!message.read && message.recipientId === currentUser.id) {
      try {
        await onMarkAsRead(message.id);
        const [data, count] = await Promise.all([
          getUserMessages(currentUser.id),
          getUnreadMessageCount(currentUser.id)
        ]);
        setMessages(data);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-[#1a1a1a]">Messages</h3>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {[
            { id: 'inbox', label: 'Inbox', icon: Inbox, count: unreadCount },
            { id: 'sent', label: 'Sent', icon: SendIcon },
            { id: 'compose', label: 'Compose', icon: MessageSquare }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSelectedMessage(null);
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Inbox */}
          {activeTab === 'inbox' && !selectedMessage && (
            <div className="space-y-3">
              {inboxMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No messages in your inbox</p>
                </div>
              ) : (
                inboxMessages.slice().reverse().map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleMessageClick(message)}
                    className={`p-4 rounded-2xl cursor-pointer transition-colors ${
                      message.read ? 'bg-gray-50' : 'bg-[#c4f692]/30 border border-[#c4f692]'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-[#1a1a1a]">{message.senderName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className={`mb-1 ${message.read ? 'text-gray-700' : 'font-bold text-[#1a1a1a]'}`}>
                      {message.subject}
                    </h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent */}
          {activeTab === 'sent' && !selectedMessage && (
            <div className="space-y-3">
              {sentMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <SendIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No sent messages</p>
                </div>
              ) : (
                sentMessages.slice().reverse().map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className="p-4 rounded-2xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium text-[#1a1a1a]">To: {message.recipientName}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-gray-700 mb-1">{message.subject}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{message.content}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Compose */}
          {activeTab === 'compose' && (
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <select
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4"
                  required
                >
                  <option value="">Select recipient</option>
                  {users.filter(u => u.id !== currentUser.id).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4"
                  placeholder="Enter subject..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full h-40 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4 py-3 resize-none"
                  placeholder="Type your message..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full h-12 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}

          {/* Message Detail */}
          {selectedMessage && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <button
                onClick={() => setSelectedMessage(null)}
                className="mb-4 text-sm text-gray-500 hover:text-[#1a1a1a]"
              >
                ← Back to list
              </button>
              
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">
                  {selectedMessage.senderId === currentUser.id ? 'To' : 'From'}:{' '}
                  {selectedMessage.senderId === currentUser.id 
                    ? selectedMessage.recipientName 
                    : selectedMessage.senderName}
                </div>
                <h3 className="text-xl font-bold text-[#1a1a1a]">{selectedMessage.subject}</h3>
                <div className="text-sm text-gray-500 mt-1">
                  {new Date(selectedMessage.timestamp).toLocaleString()}
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedMessage.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
