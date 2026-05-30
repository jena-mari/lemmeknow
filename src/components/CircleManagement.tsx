import React, { useState } from 'react';
import { Contact } from '../types';
import { Cloud, Plus, Trash2, Users } from 'lucide-react';

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

  const relations = ['Best Friend', 'Roommate', 'Partner', 'Sibling', 'Uni Friend', 'Group Chat', 'Going-out Crew', 'Family'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Add a name first');
      return;
    }
    if (!phone.trim()) {
      setError('Add a handle or number');
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
      'bg-light-green text-forest'
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
    <div className="lmk-page -mx-4 -my-4 min-h-full px-4 py-5 text-center text-brand-black" id="circle-management">
      <div className="lmk-shell space-y-4">
      <section className="relative z-10">
        <Cloud className="mx-auto mb-4 h-12 w-[72px] stroke-[2.45] text-brand-black" />
        <h3 className="text-[34px] font-black text-brand-black">Close Circle</h3>
        <p className="mx-auto mt-2 max-w-[290px] text-[14px] font-medium text-brand-black">The people who get your quick LMK updates.</p>
        <span className="mt-3 inline-flex rounded-full bg-white/85 px-3 py-1.5 text-xs font-black text-brand-black shadow-sm">
          {contacts.length} added
        </span>
      </section>

      <div className="relative z-10 space-y-2.5">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            id={`contact-card-${contact.id}`}
            className="flex items-center justify-between rounded-[28px] border border-white/80 bg-white/76 p-3 text-left shadow-sm backdrop-blur transition-all hover:bg-white"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black ${contact.avatarColor}`}>
                {contact.initials}
              </div>
              <div className="min-w-0 text-left">
                <div className="truncate text-sm font-black text-brand-black">{contact.name}</div>
                <div className="mt-1 flex min-w-0 items-center gap-1.5">
                  <span className="shrink-0 rounded-full bg-azure px-1.5 py-0.5 text-[10px] font-bold text-brand-black">
                    {contact.relationship}
                  </span>
                  <span className="truncate text-[11px] font-bold text-brand-black/65">{contact.phone}</span>
                </div>
              </div>
            </div>

            {contacts.length > 2 ? (
              <button
                onClick={() => onRemoveContact(contact.id)}
                className="rounded-full p-2 text-brand-black/60 transition-colors hover:bg-pink-accent/40 hover:text-brand-black"
                title="Remove Contact"
                id={`btn-remove-${contact.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <span className="pl-2 text-[9px] font-bold text-brand-black/55">min 2</span>
            )}
          </div>
        ))}
      </div>

      {!showAddForm ? (
        <button
          onClick={() => { setShowAddForm(true); setError(''); }}
          className="lmk-primary relative z-10 flex h-[58px] w-full items-center justify-center gap-2 bg-yellow-orange text-[17px] font-medium text-black transition-all hover:bg-yellow-orange/90"
          id="btn-add-contact-trigger"
        >
          <Plus className="h-4 w-4" />
          <span>Add someone</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="lmk-panel relative z-10 space-y-3 p-4" id="add-contact-form">
          <div className="text-left">
            <label className="mb-1 block text-[10px] font-black uppercase text-brand-black/65">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Rachel Green"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-[20px] border border-white/80 bg-white/82 p-3 text-sm font-bold text-brand-black focus:outline-none focus:ring-1 focus:ring-forest"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase text-brand-black/65">Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full cursor-pointer rounded-[20px] border border-white/80 bg-white/82 p-3 text-xs font-bold text-brand-black focus:outline-none"
              >
                {relations.map((rel) => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-black uppercase text-brand-black/65">Handle / number</label>
              <input
                type="text"
                placeholder="@mia"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-[20px] border border-white/80 bg-white/82 p-3 text-xs font-bold text-brand-black focus:outline-none focus:ring-1 focus:ring-forest"
                required
              />
            </div>
          </div>

          {error && <p className="text-xs font-medium text-red-500">{error}</p>}

          <div className="flex gap-2 pt-1.5">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="flex-1 rounded-full bg-white py-3 text-xs font-black text-brand-black hover:bg-white/80"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-full bg-yellow-orange py-3 text-xs font-black text-black hover:bg-yellow-orange/90"
            >
              Add Contact
            </button>
          </div>
        </form>
      )}

      <div className="relative z-10 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold text-brand-black/70">
        <Users className="h-3.5 w-3.5" />
        <span>Only your circle sees your updates</span>
      </div>
      </div>
    </div>
  );
}
