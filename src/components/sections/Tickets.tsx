import { useState } from 'react';
import { X, Ticket, Send, AlertCircle, Check, Clock, Settings, MessageSquare } from 'lucide-react';
import type { Ticket as TicketType, ProfileSettings } from '@/types';

interface TicketsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  tickets: TicketType[];
  profileSettings: ProfileSettings;
  onCreateTicket: (subject: string, message: string, category: 'bug' | 'feature' | 'support' | 'other') => void;
  onUpdateSettings?: (settings: Partial<ProfileSettings>) => void;
  isAdmin?: boolean;
  onUpdateTicket?: (ticketId: string, updates: Partial<TicketType>) => void;
}

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report', color: 'bg-red-100 text-red-700' },
  { value: 'feature', label: 'Feature Request', color: 'bg-blue-100 text-blue-700' },
  { value: 'support', label: 'Support', color: 'bg-green-100 text-green-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' }
] as const;

const STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-700' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-700' }
];

export function TicketsModal({
  isOpen,
  onClose,
  currentUserId,
  tickets,
  profileSettings,
  onCreateTicket,
  onUpdateSettings,
  isAdmin = false,
  onUpdateTicket
}: TicketsProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'settings'>('list');
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'support' | 'other'>('support');
  const [supportEmail, setSupportEmail] = useState(profileSettings.supportEmail);
  const [adminResponse, setAdminResponse] = useState('');

  if (!isOpen) return null;

  const userTickets = tickets.filter(t => t.userId === currentUserId);
  const allTickets = isAdmin ? tickets : userTickets;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subject && message) {
      onCreateTicket(subject, message, category);
      setSubject('');
      setMessage('');
      setCategory('support');
      setActiveTab('list');
    }
  };

  const handleSettingsSave = () => {
    if (onUpdateSettings) {
      onUpdateSettings({ supportEmail });
    }
  };

  const handleResponseSubmit = () => {
    if (onUpdateTicket && selectedTicket && adminResponse) {
      onUpdateTicket(selectedTicket.id, {
        adminResponse,
        respondedAt: new Date().toISOString(),
        status: 'resolved'
      });
      setAdminResponse('');
      setSelectedTicket(null);
    }
  };

  const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;
  const getCategoryColor = (cat: string) => CATEGORIES.find(c => c.value === cat)?.color || 'bg-gray-100';
  const getStatusColor = (status: string) => STATUSES.find(s => s.value === status)?.color || 'bg-gray-100';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <Ticket size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                {isAdmin ? 'Support Tickets' : 'Help & Feedback'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {allTickets.length} ticket{allTickets.length !== 1 ? 's' : ''}
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
            onClick={() => { setActiveTab('list'); setSelectedTicket(null); }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
              activeTab === 'list'
                ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                : 'bg-white border-[rgba(26,26,26,0.2)]'
            }`}
          >
            <MessageSquare size={16} />
            <span className="text-sm font-bold">Tickets</span>
          </button>
          <button
            onClick={() => { setActiveTab('create'); setSelectedTicket(null); }}
            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
              activeTab === 'create'
                ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                : 'bg-white border-[rgba(26,26,26,0.2)]'
            }`}
          >
            <Send size={16} />
            <span className="text-sm font-bold">New Ticket</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => { setActiveTab('settings'); setSelectedTicket(null); }}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-[3px] transition-all ${
                activeTab === 'settings'
                  ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                  : 'bg-white border-[rgba(26,26,26,0.2)]'
              }`}
            >
              <Settings size={16} />
              <span className="text-sm font-bold">Settings</span>
            </button>
          )}
        </div>

        {/* Ticket List */}
        {activeTab === 'list' && !selectedTicket && (
          <div className="space-y-2">
            {allTickets.length === 0 ? (
              <div className="text-center py-8 bg-[var(--bg-primary)] rounded-xl">
                <Ticket size={32} className="mx-auto mb-2 text-[var(--text-secondary)]" />
                <p className="text-sm text-[var(--text-secondary)]">No tickets yet</p>
              </div>
            ) : (
              allTickets.slice().reverse().map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className="w-full card p-3 text-left transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getCategoryColor(ticket.category)}`}>
                          {getCategoryLabel(ticket.category)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="font-bold text-sm">{ticket.subject}</p>
                      {isAdmin && <p className="text-xs text-[var(--text-secondary)]">From: {ticket.userName}</p>}
                    </div>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* Create Ticket */}
        {activeTab === 'create' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="micro-label block mb-1 text-xs">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border-[3px] text-sm font-bold transition-all ${
                      category === cat.value
                        ? 'bg-[var(--accent)] border-[rgba(26,26,26,0.85)]'
                        : 'bg-white border-[rgba(26,26,26,0.2)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="micro-label block mb-1 text-xs">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-field text-sm"
                placeholder="Brief description of your issue..."
                required
              />
            </div>
            <div>
              <label className="micro-label block mb-1 text-xs">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field rounded-2xl py-3 text-sm"
                rows={5}
                placeholder="Describe your issue in detail..."
                required
              />
            </div>
            <div className="p-3 bg-[var(--card-yellow)] rounded-xl">
              <p className="text-xs text-[var(--text-secondary)]">
                <AlertCircle size={12} className="inline mr-1" />
                Your ticket will be sent to: <strong>{profileSettings.supportEmail}</strong>
              </p>
            </div>
            <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2">
              <Send size={16} />
              Submit Ticket
            </button>
          </form>
        )}

        {/* Settings (Admin Only) */}
        {isAdmin && activeTab === 'settings' && (
          <div className="space-y-4">
            <div>
              <label className="micro-label block mb-1 text-xs">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="input-field text-sm"
                placeholder="e.g., support@school.edu"
              />
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Tickets will be sent to this email address
              </p>
            </div>
            <button
              onClick={handleSettingsSave}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <Check size={16} />
              Save Settings
            </button>
          </div>
        )}

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="card p-4">
            <button
              onClick={() => setSelectedTicket(null)}
              className="mb-4 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              ← Back to tickets
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getCategoryColor(selectedTicket.category)}`}>
                {getCategoryLabel(selectedTicket.category)}
              </span>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(selectedTicket.status)}`}>
                {selectedTicket.status}
              </span>
            </div>
            
            <h4 className="font-bold text-lg mb-2">{selectedTicket.subject}</h4>
            
            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mb-4">
              <Clock size={12} />
              <span>Submitted on {new Date(selectedTicket.createdAt).toLocaleString()}</span>
            </div>

            {isAdmin && (
              <p className="text-sm mb-4">
                <strong>From:</strong> {selectedTicket.userName} ({selectedTicket.userEmail})
              </p>
            )}
            
            <div className="bg-[var(--bg-primary)] rounded-xl p-4 mb-4">
              <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{selectedTicket.message}</p>
            </div>

            {/* Admin Response */}
            {selectedTicket.adminResponse && (
              <div className="mb-4">
                <h5 className="font-bold text-sm mb-2">Admin Response</h5>
                <div className="bg-[var(--card-mint)] rounded-xl p-4">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicket.adminResponse}</p>
                  {selectedTicket.respondedAt && (
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      Responded on {new Date(selectedTicket.respondedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Admin Reply Form */}
            {isAdmin && onUpdateTicket && selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
              <div className="space-y-3">
                <label className="micro-label block text-xs">Your Response</label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="input-field rounded-2xl py-3 text-sm"
                  rows={3}
                  placeholder="Type your response..."
                />
                <button
                  onClick={handleResponseSubmit}
                  disabled={!adminResponse}
                  className="w-full btn-primary text-sm disabled:opacity-50"
                >
                  Send Response & Mark Resolved
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
