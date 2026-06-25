/*
  Arrival skeletons — not "loading" states.

  The discipline here is continuity: each skeleton reuses the *exact* card shells
  of the screen it stands in for (same radius, border, padding, elevation as
  `AppCard`), so when the real content replaces it nothing jumps — only the text
  fills in. A single calm `.skeleton` sweep crosses every placeholder in unison
  (one breath, see globals.css), and `prefers-reduced-motion` resolves it to a
  still, quiet fill. The screen settles into being; it never throbs.
*/

// A pill-shaped line of text (eyebrows, titles, body, labels).
function Line({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-full ${className}`} />;
}

// A larger surface (inputs, chips, buttons, avatars) — radius set per use.
function Block({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton ${className}`} style={style} />;
}

// Card shells mirror AppCard levels 1:1 so the frame is identical across the swap.
const HERO_CARD =
  "premium-surface rounded-xl border border-white/8 p-6 shadow-e3 backdrop-blur-xl";
const PRIMARY_CARD =
  "premium-surface rounded-lg border border-white/8 p-5 shadow-e2 backdrop-blur-xl";
const QUIET_CARD = "rounded-lg border border-white/6 bg-surface-quiet p-4";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="min-h-dvh bg-background"
      aria-busy="true"
      aria-hidden="true"
    >
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pb-40 pt-7 sm:px-6 sm:pt-9">
        {children}
      </div>
    </main>
  );
}

// Matches ScreenContainer's header: eyebrow above a display title.
function Header() {
  return (
    <div className="mb-7">
      <Line className="mb-3 h-3 w-24" />
      <Line className="h-9 w-28" />
    </div>
  );
}

// ── Today (default / cold-start landing) ────────────────────────────────────
// Mirrors TodayScreen: identity hero + primary action, then the quiet circle card.
export function RouteSkeleton() {
  return (
    <Frame>
      <Header />
      <div className="flex flex-1 flex-col gap-4">
        <section className={HERO_CARD}>
          <Line className="h-3 w-28" />
          <Line className="mt-4 h-7 w-full" />
          <Line className="mt-2.5 h-7 w-3/5" />
          <Line className="mt-5 h-4 w-52" />
          <Block className="mt-7 h-13 w-full rounded-full" />
        </section>

        <section className={QUIET_CARD}>
          <Line className="h-3 w-20" />
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              <Block className="h-8 w-8 rounded-full ring-2 ring-[var(--surface)]" />
              <Block className="h-8 w-8 rounded-full ring-2 ring-[var(--surface)]" />
              <Block className="h-8 w-8 rounded-full ring-2 ring-[var(--surface)]" />
            </div>
            <Line className="h-4 w-40" />
          </div>
        </section>
      </div>
    </Frame>
  );
}

// ── Commit ──────────────────────────────────────────────────────────────────
// Mirrors CommitFlowClient: 3-step progress, tall hero form, two footer buttons.
export function CommitSkeleton() {
  return (
    <Frame>
      <Header />
      <div className="flex flex-1 flex-col gap-5">
        <div className="grid grid-cols-3 gap-2">
          <Block className="h-1.5 rounded-full" />
          <Block className="h-1.5 rounded-full" />
          <Block className="h-1.5 rounded-full" />
        </div>

        <section className={`${HERO_CARD} min-h-100`}>
          <Line className="h-3 w-28" />
          <Line className="mt-4 h-6 w-3/5" />
          <Line className="mt-2.5 h-4 w-4/5" />
          <div className="mt-8 flex flex-col gap-5">
            <Line className="h-3 w-24" />
            <Block className="h-12 w-full rounded-md" />
            <div className="flex flex-wrap gap-2">
              {[20, 24, 16, 24, 20, 16].map((w, i) => (
                <Block
                  className="h-9 rounded-full"
                  key={i}
                  style={{ width: `${w * 4}px` }}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-[0.9fr_1.4fr] gap-3">
          <Block className="h-13 rounded-full" />
          <Block className="h-13 rounded-full" />
        </div>
      </div>
    </Frame>
  );
}

// ── Archive ───────────────────────────────────────────────────────────────────
// Mirrors a list of DomainCommitCards.
export function ArchiveSkeleton() {
  return (
    <Frame>
      <Header />
      <div className="flex flex-1 flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <section className={PRIMARY_CARD} key={i}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <Line className="h-5 w-32" />
                <Line className="mt-2 h-3 w-24" />
              </div>
              <Block className="h-7 w-24 rounded-full" />
            </div>
            <Line className="mt-4 h-4 w-full" />
            <Line className="mt-2 h-4 w-2/3" />
          </section>
        ))}
      </div>
    </Frame>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
// Mirrors ProfileScreen: identity-quote hero with avatar row, then quiet cards.
export function ProfileSkeleton() {
  return (
    <Frame>
      <Header />
      <div className="flex flex-1 flex-col gap-4">
        <section className={HERO_CARD}>
          <Line className="h-5 w-full" />
          <Line className="mt-3 h-5 w-3/4" />
          <div className="mt-8 flex items-center gap-4 border-t border-white/8 pt-6">
            <Block className="h-14 w-14 rounded-full" />
            <div>
              <Line className="h-4 w-32" />
              <Line className="mt-2 h-3 w-40" />
            </div>
          </div>
        </section>

        <section className={QUIET_CARD}>
          <Line className="h-3 w-24" />
          <Line className="mt-4 h-3 w-20" />
          <Block className="mt-2 h-12 w-full rounded-md" />
          <Line className="mt-4 h-3 w-20" />
          <Block className="mt-2 h-12 w-full rounded-md" />
        </section>

        <section className={QUIET_CARD}>
          <Block className="h-12 w-full rounded-full" />
        </section>
      </div>
    </Frame>
  );
}

// ── Circle ────────────────────────────────────────────────────────────────────
// Mirrors an intro hero and a quiet list of members.
export function CircleSkeleton() {
  return (
    <Frame>
      <Header />
      <div className="flex flex-1 flex-col gap-4">
        <section className={HERO_CARD}>
          <Line className="h-3 w-28" />
          <Line className="mt-4 h-6 w-3/5" />
          <Line className="mt-2.5 h-4 w-4/5" />
        </section>

        <section className={QUIET_CARD}>
          <Line className="h-3 w-20" />
          <div className="mt-4 flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div className="flex items-center gap-3" key={i}>
                <Block className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Line className="h-4 w-32" />
                  <Line className="mt-2 h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Frame>
  );
}
