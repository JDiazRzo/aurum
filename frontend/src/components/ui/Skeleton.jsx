// Bloque genérico con animación pulse dorada
export const Skeleton = ({ className = '' }) => (
  <div
    className={`rounded-lg bg-white/5 animate-pulse ${className}`}
    style={{ animationDuration: '1.4s' }}
  />
)

// Skeleton de una Card completa
export const CardSkeleton = ({ lines = 2, className = '' }) => (
  <div className={`rounded-xl border border-white/5 bg-white/[0.02] p-5 ${className}`}>
    <Skeleton className="h-3 w-24 mb-4" />
    <Skeleton className="h-8 w-40 mb-2" />
    {lines >= 2 && <Skeleton className="h-3 w-32 mt-2" />}
    {lines >= 3 && <Skeleton className="h-3 w-20 mt-1.5" />}
  </div>
)

// Skeleton de fila de tabla/lista
export const RowSkeleton = ({ count = 4 }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3.5 w-36" style={{ width: `${120 + (i % 3) * 24}px` }} />
          <Skeleton className="h-2.5 w-24" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
    ))}
  </div>
)

// Layout de carga completo — mismo chrome que Layout (sidebar ya renderizado)
export const DashboardSkeleton = () => (
  <div className="fade-in">
    {/* Encabezado */}
    <div className="mb-8">
      <Skeleton className="h-3 w-28 mb-2" />
      <Skeleton className="h-9 w-48 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>

    {/* Balance hero */}
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6 relative overflow-hidden">
      <Skeleton className="h-3 w-28 mb-3" />
      <Skeleton className="h-12 w-56 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>

    {/* Stat cards */}
    <div className="flex gap-4 mb-6">
      <CardSkeleton className="flex-1" />
      <CardSkeleton className="flex-1" />
    </div>

    {/* Chart */}
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 mb-6">
      <Skeleton className="h-3 w-48 mb-4" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>

    {/* Grid 2 col */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <CardSkeleton lines={3} />
      <CardSkeleton lines={3} />
    </div>

    {/* Insight cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} lines={3} />
      ))}
    </div>
  </div>
)

export const TransactionsSkeleton = () => (
  <div className="fade-in">
    <div className="mb-8">
      <Skeleton className="h-9 w-40 mb-1" />
      <Skeleton className="h-3 w-28" />
    </div>
    {/* Filtros */}
    <div className="flex gap-3 mb-6">
      {[80, 100, 60].map((w, i) => (
        <Skeleton key={i} className="h-9 rounded-lg" style={{ width: w }} />
      ))}
    </div>
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <RowSkeleton count={8} />
    </div>
  </div>
)

export const BudgetsSkeleton = () => (
  <div className="fade-in">
    <div className="mb-8">
      <Skeleton className="h-9 w-44 mb-1" />
      <Skeleton className="h-3 w-28" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <CardSkeleton lines={3} />
      <CardSkeleton lines={3} />
    </div>
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
      <Skeleton className="h-3 w-32 mb-5" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
)
