interface EmptyStateProps {
  message?: string
  description?: string
  icon?: React.ReactNode
}

export default function EmptyState({
  message = 'No data found.',
  description,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      {icon ? (
        <div className="mb-4 text-gray-300">{icon}</div>
      ) : (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      )}
      <p className="text-sm font-medium text-gray-500">{message}</p>
      {description && <p className="mt-1 text-xs text-gray-400">{description}</p>}
    </div>
  )
}
