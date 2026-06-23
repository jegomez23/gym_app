export function RouteSkeleton() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-40 pt-7 sm:px-6 sm:pt-9">
        <div className="mb-7">
          <div className="mb-2 h-3 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-9 w-64 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-52 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          {/* Hero placeholder */}
          <div className="rounded-xl border border-white/8 bg-white/[0.04] p-6">
            <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 h-8 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-16 animate-pulse rounded-md bg-white/5" />
              <div className="h-16 animate-pulse rounded-md bg-white/5" />
            </div>
          </div>
          {[0, 1].map((i) => (
            <div
              className="rounded-lg border border-white/6 bg-white/[0.025] p-5"
              key={i}
            >
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-5 w-44 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
