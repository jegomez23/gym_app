import type { SVGProps } from "react";

/*
  One icon language for the whole product.
  Stroke-based, 24px grid, 1.75 weight, currentColor, round caps/joins.
  Add a glyph here before using it — never inline one-off SVGs in features.
*/

export type IconName =
  | "today"
  | "archive"
  | "commit"
  | "circle"
  | "profile"
  | "bell"
  | "check"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "flame"
  | "arrow-right"
  | "feeling-light"
  | "feeling-steady"
  | "feeling-deep"
  | "shield"
  | "send";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, React.ReactNode> = {
  today: (
    <>
      <rect x="3.5" y="4.5" width="17" height="16" rx="3" />
      <path d="M3.5 9h17M8 3v3M16 3v3" />
    </>
  ),
  archive: (
    <>
      <rect x="3.5" y="4.5" width="17" height="5" rx="1.5" />
      <path d="M5 9.5v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8M10 13h4" />
    </>
  ),
  commit: <path d="M12 5v14M5 12h14" />,
  circle: (
    <>
      <circle cx="9" cy="9" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 6.2a3.2 3.2 0 0 1 0 6M17 19a5.5 5.5 0 0 0-2.2-4.4" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5a7 7 0 0 1 14 0" />
    </>
  ),
  bell: (
    <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 19a2 2 0 0 0 4 0" />
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  "chevron-left": <path d="M14.5 6l-6 6 6 6" />,
  "chevron-right": <path d="M9.5 6l6 6-6 6" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  flame: (
    <path d="M12 3c1 3 4 4 4 8a4 4 0 0 1-8 0c0-1.5.6-2.4 1.3-3.2C10 9 11 6.5 12 3Z" />
  ),
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  "feeling-light": (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3.5v2.5M12 18v2.5M3.5 12H6M18 12h2.5M6 6l1.7 1.7M16.3 16.3 18 18M18 6l-1.7 1.7M7.7 16.3 6 18" />
    </>
  ),
  "feeling-steady": <path d="M4 12h4l2.5-6 3 13 2.5-7H20" />,
  "feeling-deep": <path d="M17 5a7 7 0 1 0 2 9 5.5 5.5 0 0 1-2-9Z" />,
  shield: <path d="M12 3.5l7 2.5v5c0 4.5-3 7.5-7 9.5-4-2-7-5-7-9.5V6Z" />,
  send: <path d="M5 12 19 5l-5 14-3-6Z" />,
};

export function Icon({ name, size = 24, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
