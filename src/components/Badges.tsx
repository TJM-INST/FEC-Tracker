export const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  critical: 'bg-red-100 text-red-700',
};

export const statusColors: Record<string, string> = {
  submitted: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  in_review: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
};

export const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
};

export const categoryLabels: Record<string, string> = {
  bug_fix: 'Bug Fix',
  enhancement: 'Enhancement',
  new_feature: 'New Feature',
};

export const locationLabels: Record<string, string> = {
  trade_entry_window: 'Trade Entry Window',
  customer_window: 'Customer Window',
  account_window: 'Account Window',
  order_blotter: 'Order Blotter',
  position_manager: 'Position Manager',
  risk_dashboard: 'Risk Dashboard',
  reports: 'Reports',
  admin: 'Admin',
  other: 'Other',
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[priority] ?? 'bg-gray-100 text-gray-600'}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}
