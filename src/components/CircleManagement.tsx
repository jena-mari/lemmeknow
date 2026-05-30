import React, { useState } from 'react';
import { Contact } from '../types';
import { Plus, Trash2, ShieldCheck, HelpCircle, Users } from 'lucide-react';

interface CircleManagementProps {
  contacts: Contact[];
  onAddContact: (contact: Contact) => void;
  onRemoveContact: (id: string) => void;
}

export default function CircleManagement({
  contacts,
  onAddContact,
  onRemoveContact,
}: CircleManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Best Friend');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const relations = ['Mom', 'Dad', 'Sister', 'Brother', 'Partner', 'Husband', 'Wife', 'Best Friend', 'Guardian', 'Flatmate'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    // Generate clean initials
    const nameParts = name.trim().split(' ');
    const initials = nameParts.map(p => p[0]).join('').toUpperCase().slice(0, 2);

    // Pick random soft background color
    const colors = [
      'bg-azure text-forest',
      'bg-pink-accent text-forest',
      'bg-[#ebdcb9] text-forest',
      'bg-yellow-orange/30 text-forest',
      'bg-[#d1e5db] text-forest'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newContact: Contact = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      relationship,
      phone: phone.trim(),
      avatarColor: randomColor,
      initials: initials || '??',
      isCustom: true
    };

    onAddContact(newContact);
    
    // Reset
    setName('');
    setPhone('');
    setError('');
    setShowAddForm(false);
  };

  return (
    <div className="p-4 bg-cloud rounded-3xl border border-forest/10 space-y-4 shadow-sm" id="circle-management">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-forest" />
          <h3 className="font-serif text-lg font-bold text-forest">Trusted Circle</h3>
        </div>
        <span className="text-xs bg-forest/5 text-forest px-2 py-0.5 rounded-full font-mono">
          {contacts.length} added
        </span>
      </div>

      <p className="text-xs text-forest/75 leading-relaxed bg-azure/20 p-2.5 rounded-2xl border border-azure/40">
        🔒 <strong>Private by default:</strong> These are the only people who can see your LMK updates. No public feed, no follower count, and no always-on social broadcasting.
      </p>

      {/* Contact List */}
      <div className="space-y-2.5">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            id={`contact-card-${contact.id}`}
            className="flex items-center justify-between p-3 bg-white hover:bg-white/95 rounded-2xl border border-forest/5 shadow-2sm hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${contact.avatarColor}`}>
                {contact.initials}
              </div>
              <div className="text-left">
                <div className="font-semibold text-sm text-forest flex items-center gap-1.5">
                  {contact.name}
                  <span className="text-[10px] bg-azure font-medium text-forest/80 px-1.5 py-0.5 rounded-md">
                    {contact.relationship}
                  </span>
                </div>
                <div className="text-[11px] text-forest/60 font-mono">{contact.phone}</div>
              </div>
            </div>

            {contacts.length > 2 ? (
              <button
                onClick={() => onRemoveContact(contact.id)}
                className="p-2 text-forest/40 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                title="Remove Contact"
                id={`btn-remove-${contact.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-[9px] text-forest/40 font-mono italic pr-2">Circle limit (min 2)</span>
            )}
          </div>
        ))}
      </div>

      {/* Add Button & Form */}
      {!showAddForm ? (
        <button
          onClick={() => { setShowAddForm(true); setError(''); }}
          className="w-full py-2.5 bg-azure hover:bg-[#b0d8fa] text-forest rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 border border-forest/10 shadow-2sm cursor-pointer"
          id="btn-add-contact-trigger"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trusted Contact</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-3.5 bg-white rounded-2xl border border-forest/10 space-y-3" id="add-contact-form">
          <div className="text-left">
            <label className="text-[10px] font-bold text-forest uppercase tracking-wider block mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rachel Green"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-cloud/50 border border-forest/10 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-forest text-forest"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <label className="text-[10px] font-bold text-forest uppercase tracking-wider block mb-1">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full p-2.5 bg-cloud/50 border border-forest/10 rounded-xl text-xs focus:outline-none cursor-pointer text-forest"
              >
                {relations.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-forest uppercase tracking-wider block mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="+61 400 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-cloud/50 border border-forest/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-forest text-forest"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

          <div className="flex gap-2 pt-1.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 bg-cloud text-forest rounded-xl text-xs font-semibold hover:bg-forest/5 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-yellow-orange text-forest rounded-xl text-xs font-semibold hover:bg-yellow-orange/90 cursor-pointer"
            >
              Add Contact
            </button>
          </div>
        </form>
      )}

      <div className="flex items-center gap-1.5 justify-center py-1.5 text-[9px] text-forest/50 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-forest/70" />
        <span>End-to-End Private Node Connection</span>
      </div>
    </div>
  );
}
