export function RouteSkeleton() {
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-48 pt-7 sm:px-6 sm:pt-9">
        <div className="mb-7">
          <div className="mb-2 h-3 w-20 animate-pulse rounded-full bg-white/10" />
          <div className="h-9 w-72 animate-pulse rounded-full bg-white/10" />
          <div className="mt-3 h-4 w-52 animate-pulse rounded-full bg-white/10" />
        </div>
        <div className="flex flex-1 flex-col gap-4">
          {[0, 1, 2].map((i) => (
            <div
              className="rounded-3xl border border-white/5 bg-white/[0.03] p-6"
              key={i}
            >
              <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-6 w-48 animate-pulse rounded-full bg-white/10" />
              <div className="mt-3 h-4 w-36 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
