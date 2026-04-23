import React from 'react';

// Generic skeleton loader
export function SkeletonLoader({ width = 'w-full', height = 'h-10' }: { width?: string; height?: string }) {
  return (
    <div
      className={`${width} ${height} bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-lg animate-pulse`}
    />
  );
}

// Skeleton for a card
export function CardSkeleton() {
  return (
    <div className="bg-slate-800/80 rounded-lg border border-white/10 p-6 space-y-4">
      <SkeletonLoader width="w-2/3" height="h-6" />
      <div className="space-y-2">
        <SkeletonLoader width="w-full" height="h-4" />
        <SkeletonLoader width="w-5/6" height="h-4" />
      </div>
      <div className="flex gap-2 pt-2">
        <SkeletonLoader width="w-20" height="h-8" />
        <SkeletonLoader width="w-20" height="h-8" />
      </div>
    </div>
  );
}

// Skeleton for employee list
export function EmployeeListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-white/10">
          <SkeletonLoader width="w-12" height="h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader width="w-1/3" height="h-4" />
            <SkeletonLoader width="w-1/2" height="h-3" />
          </div>
          <SkeletonLoader width="w-20" height="h-8" />
        </div>
      ))}
    </div>
  );
}

// Skeleton for dashboard metrics
export function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-slate-800/80 rounded-lg border border-white/10 p-6">
          <div className="space-y-3">
            <SkeletonLoader width="w-1/2" height="h-4" />
            <SkeletonLoader width="w-2/3" height="h-8" />
            <SkeletonLoader width="w-1/3" height="h-3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-slate-900/50 border-b border-white/10">
        {[...Array(columns)].map((_, i) => (
          <div key={`header-${i}`} className="flex-1">
            <SkeletonLoader width="w-full" height="h-4" />
          </div>
        ))}
      </div>

      {/* Rows */}
      {[...Array(rows)].map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 p-4 border-b border-white/10 last:border-b-0">
          {[...Array(columns)].map((_, colIdx) => (
            <div key={`cell-${rowIdx}-${colIdx}`} className="flex-1">
              <SkeletonLoader width="w-full" height="h-4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Page loading overlay
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-talibon-red rounded-full animate-spin" />
        <p className="text-white font-semibold">Loading...</p>
      </div>
    </div>
  );
}

// Error state component
export function ErrorState({
  title = 'Error',
  message = 'Something went wrong',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-talibon-red text-white rounded-lg hover:bg-talibon-red/90 transition-colors font-semibold text-sm"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({
  title = 'No data',
  message = 'No items to display',
  icon = '📭',
}: {
  title?: string;
  message?: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}
