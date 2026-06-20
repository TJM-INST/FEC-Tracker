'use client';
import { useState } from 'react';
import type { Request } from '@/lib/schema';

type Props = {
  initial?: Partial<Request>;
  onSave: (data: Partial<Request>) => Promise<void>;
  onCancel: () => void;
};

const priorities = ['low', 'medium', 'high', 'critical'] as const;
const categories = ['bug_fix', 'enhancement', 'new_feature'] as const;
const locations = [
  'trade_entry_window', 'customer_window', 'account_window',
  'order_blotter', 'position_manager', 'risk_dashboard', 'reports', 'admin', 'other',
] as const;
const categoryLabels: Record<string, string> = {
  bug_fix: 'Bug Fix', enhancement: 'Enhancement', new_feature: 'New Feature',
};
const locationLabels: Record<string, string> = {
  trade_entry_window: 'Trade Entry Window',
  customer_window: 'Customer Window',
  account_window: 'Account Window',
  order_blotter: 'Confirm Window',
  position_manager: 'Position Manager',
  risk_dashboard: 'Risk Dashboard',
  reports: 'Reports',
  admin: 'Admin',
  other: 'Other',
};

export default function RequestForm({ initial = {}, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial.title ?? '');
  const [description, setDescription] = useState(initial.description ?? '');
  const [priority, setPriority] = useState<typeof priorities[number]>(initial.priority ?? 'medium');
  const [category, setCategory] = useState<typeof categories[number]>(initial.category ?? 'enhancement');
  const [location, setLocation] = useState<typeof locations[number]>(initial.location ?? 'other');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await onSave({ title, description, priority, category, location });
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Short summary of the request"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Detailed description of the change requested"
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priorities[number])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as typeof categories[number])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value as typeof locations[number])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {locations.map((l) => (
              <option key={l} value={l}>{locationLabels[l]}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
