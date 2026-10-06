interface LoadingStateProps {
  message?: string
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
