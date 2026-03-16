import { useState, useEffect } from 'react';
import { X, Plus, MessageSquare, Settings, Loader2, Bug, Lightbulb, HelpCircle, MoreHorizontal, CheckCircle } from 'lucide-react';
import type { Ticket, ProfileSettings, User } from '@/types';

interface TicketsProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  tickets: Ticket[];
  profileSettings: ProfileSettings;
  onCreateTicket: (subject: string, message: string, category: 'bug' | 'feature' | 'support' | 'other') => Promise<void>;
  onUpdateSettings?: (settings: Partial<ProfileSettings>) => Promise<void>;
  isAdmin?: boolean;
  onUpdateTicket?: (ticketId: string, updates: Partial<Ticket>) => Promise<void>;
  getTickets: () => Promise<Ticket[]>;
  getUserTickets: (userId: string) => Promise<Ticket[]>;
}

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report', color: 'bg-red-100 text-red-700', icon: Bug },
  { value: 'feature', label: 'Feature Request', color: 'bg-blue-100 text-blue-700', icon: Lightbulb },
  { value: 'support', label: 'Support', color: 'bg-green-100 text-green-700', icon: HelpCircle },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700', icon: MoreHorizontal }
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
  currentUser,
  tickets: initialTickets,
  profileSettings,
  onCreateTicket,
  onUpdateSettings,
  isAdmin = false,
  onUpdateTicket,
  getTickets,
  getUserTickets
}: TicketsProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'settings'>('list');
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<'bug' | 'feature' | 'support' | 'other'>('support');
  const [supportEmail, setSupportEmail] = useState(profileSettings.supportEmail);
  const [adminResponse, setAdminResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load tickets from Firebase
  useEffect(() => {
    const loadTickets = async () => {
      try {
        const data = isAdmin 
          ? await getTickets() 
          : await getUserTickets(currentUser.id);
        setTickets(data);
      } catch (error) {
        console.error('Error loading tickets:', error);
      }
    };

    if (isOpen) {
      loadTickets();
    }
  }, [isOpen, isAdmin, currentUser.id, getTickets, getUserTickets]);

  if (!isOpen) return null;

  const userTickets = tickets.filter(t => t.userId === currentUser.id);
  const allTickets = isAdmin ? tickets : userTickets;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      await onCreateTicket(subject, message, category);
      const data = await getUserTickets(currentUser.id);
      setTickets(data);
      setActiveTab('list');
      setSubject('');
      setMessage('');
      setCategory('support');
    } catch (error) {
      console.error('Error creating ticket:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettingsSave = async () => {
    if (onUpdateSettings) {
      try {
        await onUpdateSettings({ supportEmail });
        alert('Settings saved!');
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  };

  const handleResponseSubmit = async () => {
    if (!onUpdateTicket || !selectedTicket || !adminResponse) return;
    
    try {
      await onUpdateTicket(selectedTicket.id, {
        adminResponse,
        respondedAt: new Date().toISOString(),
        status: 'resolved'
      });
      const data = await getTickets();
      setTickets(data);
      setAdminResponse('');
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error submitting response:', error);
    }
  };

  const getCategoryLabel = (cat: string) => CATEGORIES.find(c => c.value === cat)?.label || cat;
  const getCategoryColor = (cat: string) => CATEGORIES.find(c => c.value === cat)?.color || 'bg-gray-100';
  const getCategoryIcon = (cat: string) => CATEGORIES.find(c => c.value === cat)?.icon || MessageSquare;
  const getStatusColor = (status: string) => STATUSES.find(s => s.value === status)?.color || 'bg-gray-100';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="text-2xl font-bold text-[#1a1a1a]">
              {isAdmin ? 'Support Tickets' : 'Help & Feedback'}
            </h3>
            <p className="text-gray-500 mt-1">
              {allTickets.length} ticket{allTickets.length !== 1 ? 's' : ''}
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
          <button
            onClick={() => { setActiveTab('list'); setSelectedTicket(null); }}
            className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'list' ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]' : 'text-gray-500'}`}
          >
            Tickets
          </button>
          <button
            onClick={() => { setActiveTab('create'); setSelectedTicket(null); }}
            className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'create' ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]' : 'text-gray-500'}`}
          >
            Create New
          </button>
          {isAdmin && (
            <button
              onClick={() => { setActiveTab('settings'); setSelectedTicket(null); }}
              className={`flex-1 py-4 font-medium transition-colors ${activeTab === 'settings' ? 'text-[#1a1a1a] border-b-2 border-[#1a1a1a]' : 'text-gray-500'}`}
            >
              Settings
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Ticket List */}
          {activeTab === 'list' && !selectedTicket && (
            <div className="space-y-3">
              {allTickets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No tickets yet</p>
                </div>
              ) : (
                allTickets.slice().reverse().map((ticket) => {
                  const CategoryIcon = getCategoryIcon(ticket.category);
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-[#1a1a1a]">{ticket.subject}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{ticket.message}</p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{getCategoryLabel(ticket.category)}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Create Ticket */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-xl border-2 text-left transition-colors ${
                        category === cat.value
                          ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <cat.icon className="w-5 h-5 mb-1" />
                      <span className="text-sm font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4"
                  placeholder="Brief description of your issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full h-40 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4 py-3 resize-none"
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Ticket'
                )}
              </button>
            </form>
          )}

          {/* Settings */}
          {activeTab === 'settings' && isAdmin && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full h-12 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4"
                  placeholder="support@school.edu"
                />
              </div>
              <button
                onClick={handleSettingsSave}
                className="w-full h-12 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors"
              >
                Save Settings
              </button>
            </div>
          )}

          {/* Ticket Detail */}
          {selectedTicket && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-sm text-gray-500 hover:text-[#1a1a1a]"
              >
                ← Back to tickets
              </button>

              <div className="bg-gray-50 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${getCategoryColor(selectedTicket.category)}`}>
                      {getCategoryLabel(selectedTicket.category)}
                    </span>
                    <h3 className="text-xl font-bold text-[#1a1a1a]">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      By {selectedTicket.userName} • {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">{selectedTicket.message}</p>

                {selectedTicket.adminResponse && (
                  <div className="bg-[#c4f692]/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Admin Response</span>
                    </div>
                    <p className="text-gray-700">{selectedTicket.adminResponse}</p>
                    {selectedTicket.respondedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Responded on {new Date(selectedTicket.respondedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}

                {isAdmin && onUpdateTicket && selectedTicket.status !== 'resolved' && (
                  <div className="space-y-3">
                    <textarea
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="w-full h-32 rounded-xl border-2 border-[rgba(26,26,26,0.1)] px-4 py-3 resize-none"
                      placeholder="Type your response..."
                    />
                    <button
                      onClick={handleResponseSubmit}
                      className="w-full py-3 rounded-xl bg-[#1a1a1a] text-white font-medium hover:bg-[#2a2a2a] transition-colors"
                    >
                      Send Response & Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
