interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-8 border-2 border-dashed border-primary-200 rounded-lg">
      <div className="mb-2">{icon}</div>
      <p className="text-primary-500 font-medium">{title}</p>
      {description && <p className="text-primary-400 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
