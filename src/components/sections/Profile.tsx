import { useState, useRef } from 'react';
import { X, User, Camera, Mail, Phone, MapPin, Save, Check, Calendar, Users, IdCard, Heart } from 'lucide-react';
import type { User as UserType } from '@/types';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdateProfile: (updates: Partial<UserType>) => void;
}

export function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateProfile
}: ProfileProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [birthdate, setBirthdate] = useState(user.birthdate || '');
  const [emergencyContact, setEmergencyContact] = useState(user.emergencyContact || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user.emergencyPhone || '');
  const [parentName, setParentName] = useState(user.parentName || '');
  const [studentId, setStudentId] = useState(user.studentIdNumber || '');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    onUpdateProfile({
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
      profileImage: profileImage || undefined,
      birthdate: birthdate || undefined,
      emergencyContact: emergencyContact || undefined,
      emergencyPhone: emergencyPhone || undefined,
      parentName: parentName || undefined,
      studentIdNumber: studentId || undefined
    });
    
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="card p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                My Profile
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Manage your personal information
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

        {/* Profile Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-[4px] border-[rgba(26,26,26,0.85)] overflow-hidden bg-[var(--accent)] flex items-center justify-center">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-black">{getInitials(name)}</span>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--accent)] border-[3px] border-[rgba(26,26,26,0.85)] flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Click camera icon to upload photo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="micro-label block mb-1 text-xs flex items-center gap-1">
              <User size={12} />
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="micro-label block mb-1 text-xs flex items-center gap-1">
              <Mail size={12} />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="micro-label block mb-1 text-xs flex items-center gap-1">
              <Phone size={12} />
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g., +1 234 567 8900"
            />
          </div>

          <div>
            <label className="micro-label block mb-1 text-xs flex items-center gap-1">
              <MapPin size={12} />
              Address (Optional)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g., 123 School Street"
            />
          </div>

          {/* Student ID */}
          <div>
            <label className="micro-label block mb-1 text-xs flex items-center gap-1">
              <IdCard size={12} />
              Student ID (Optional)
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g., 2024-00123"
            />
          </div>

          {/* Birthdate */}
          <div>
            <label className="micro-label block mb-1 text-xs flex items-center gap-1">
              <Calendar size={12} />
              Birthdate (Optional)
            </label>
            <input
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          {/* Parent/Guardian Name */}
          <div>
            <label className="micro-label block mb-1 text-xs flex items-center gap-1">
              <Users size={12} />
              Parent/Guardian Name (Optional)
            </label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              className="input-field text-sm"
              placeholder="e.g., John Smith"
            />
          </div>

          {/* Emergency Contact */}
          <div className="card p-4 bg-[var(--card-peach)]">
            <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Heart size={14} />
              Emergency Contact
            </h4>
            <div className="space-y-3">
              <div>
                <label className="micro-label block mb-1 text-xs">Contact Name</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g., Jane Smith"
                />
              </div>
              <div>
                <label className="micro-label block mb-1 text-xs">Emergency Phone</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g., +1 234 567 8900"
                />
              </div>
            </div>
          </div>

          {/* Role Info */}
          <div className="p-3 bg-[var(--bg-primary)] rounded-xl">
            <p className="text-xs text-[var(--text-secondary)]">
              <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              {user.grade && <span> • <strong>Grade:</strong> {user.grade}</span>}
            </p>
          </div>

          {/* Success Message */}
          {showSuccess && (
            <div className="p-3 bg-[var(--card-mint)] rounded-xl flex items-center gap-2">
              <Check size={16} className="text-green-600" />
              <span className="text-sm text-green-700">Profile updated successfully!</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
