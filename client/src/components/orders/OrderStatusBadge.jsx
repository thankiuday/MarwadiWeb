const statusConfig = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  accepted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Accepted' },
  preparing: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Preparing' },
  completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
};

export default function OrderStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
