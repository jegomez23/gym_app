import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useCircleRealtime } from "./useCircleRealtime";

const refresh = vi.fn();
const removeChannel = vi.fn();
const subscribe = vi.fn(() => channel);
const on = vi.fn(() => channel);
const channel = {
  on,
  subscribe,
};
const supabase = {
  channel: vi.fn(() => channel),
  removeChannel,
};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/app/providers", () => ({
  useSupabase: () => supabase,
}));

function RealtimeProbe() {
  useCircleRealtime("00000000-0000-0000-0000-000000000001");
  return null;
}

describe("useCircleRealtime", () => {
  it("subscribes to scoped Circle tables and removes the channel", () => {
    const { unmount } = render(<RealtimeProbe />);

    expect(supabase.channel).toHaveBeenCalledWith(
      "circle:00000000-0000-0000-0000-000000000001"
    );
    expect(on).toHaveBeenCalledTimes(3);
    expect(subscribe).toHaveBeenCalled();

    unmount();

    expect(removeChannel).toHaveBeenCalledWith(channel);
  });
});
