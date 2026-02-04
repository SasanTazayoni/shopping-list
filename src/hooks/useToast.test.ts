import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "./useToast";

describe("useToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with empty message and not fading", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.message).toBe("");
    expect(result.current.fading).toBe(false);
  });

  it("show() sets message and resets fading", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.show("Hello");
    });

    expect(result.current.message).toBe("Hello");
    expect(result.current.fading).toBe(false);
  });

  it("after durationMs it sets fading=true, then clears message after fadeMs", () => {
    const { result } = renderHook(() => useToast(2500, 500));

    act(() => {
      result.current.show("Duplicate");
    });

    act(() => {
      vi.advanceTimersByTime(2499);
    });
    expect(result.current.fading).toBe(false);
    expect(result.current.message).toBe("Duplicate");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.fading).toBe(true);
    expect(result.current.message).toBe("Duplicate");

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.message).toBe("");
  });

  it("calling show() again cancels previous timers and restarts the sequence", () => {
    const { result } = renderHook(() => useToast(2500, 500));

    act(() => {
      result.current.show("First");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    act(() => {
      result.current.show("Second");
    });

    expect(result.current.message).toBe("Second");
    expect(result.current.fading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2499);
    });

    expect(result.current.fading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.fading).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.message).toBe("");
  });

  it("cleans up timers on unmount (no crashes)", () => {
    const { result, unmount } = renderHook(() => useToast(2500, 500));

    act(() => {
      result.current.show("Bye");
    });

    unmount();
    expect(() => {
      vi.runOnlyPendingTimers();
    }).not.toThrow();
  });
});
