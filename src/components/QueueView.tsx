'use client';
import { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Request } from '@/lib/schema';
import { categoryLabels, locationLabels, statusLabels } from './Badges';
import RequestForm from './RequestForm';

type Status = 'submitted' | 'in_progress' | 'in_review' | 'completed';

const statusSelectColors: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
};

const prioritySelectColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

function SortableCard({
  req,
  onChangeStatus,
  onChangePriority,
  onEdit,
  onDelete,
}: {
  req: Request;
  onChangeStatus: (id: number, status: Status) => void;
  onChangePriority: (id: number, priority: string) => void;
  onEdit: (req: Request) => void;
  onDelete: (id: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: req.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex gap-3"
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing mt-1 shrink-0"
        aria-label="Drag to reorder"
      >
        ⠿
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{req.title}</h3>
          <div className="flex gap-1.5 shrink-0">
            <select
              value={req.priority}
              onChange={(e) => onChangePriority(req.id, e.target.value)}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${prioritySelectColors[req.priority]}`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <select
              value={req.status}
              onChange={(e) => onChangeStatus(req.id, e.target.value as Status)}
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 ${statusSelectColors[req.status]}`}
            >
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.description}</p>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-400">
            {locationLabels[req.location]} · {categoryLabels[req.category]} · #{req.id} · {new Date(req.createdAt).toLocaleDateString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(req)}
              className="text-xs px-2 py-1 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(req.id)}
              className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QueueView({ initial }: { initial: Request[] }) {
  const [items, setItems] = useState<Request[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Request | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);
      setItems(reordered);
      await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: reordered.map((r) => r.id) }),
      });
    },
    [items]
  );

  async function handleCreate(data: Partial<Request>) {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const created: Request = await res.json();
    setItems((prev) => [...prev, created]);
    setShowForm(false);
  }

  async function handleEdit(data: Partial<Request>) {
    if (!editing) return;
    const res = await fetch(`/api/requests/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const updated: Request = await res.json();
    setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setEditing(null);
  }

  async function handleChangeStatus(id: number, status: Status) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const updated: Request = await res.json();
    setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleChangePriority(id: number, priority: string) {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    });
    const updated: Request = await res.json();
    setItems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this request?')) return;
    await fetch(`/api/requests/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Request Queue <span className="text-gray-400 font-normal text-base">({items.length})</span>
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + New Request
        </button>
      </div>

      {(showForm || editing) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editing ? 'Edit Request' : 'New Upgrade Request'}
          </h2>
          <RequestForm
            initial={editing ?? {}}
            onSave={editing ? handleEdit : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No requests yet</p>
          <p className="text-sm mt-1">Click &quot;New Request&quot; to add one</p>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((req) => (
              <SortableCard
                key={req.id}
                req={req}
                onChangeStatus={handleChangeStatus}
                onChangePriority={handleChangePriority}
                onEdit={setEditing}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
