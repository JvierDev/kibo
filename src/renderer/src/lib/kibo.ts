import { useEffect, useState } from "react";
import type { KiboState } from "../../../shared/types";

export function useKiboState(): KiboState | null {
  const [state, setState] = useState<KiboState | null>(null);

  useEffect(() => {
    let active = true;
    const load = (): void => {
      window.kibo.getState().then((next) => {
        if (active) setState(next);
      });
    };
    load();
    const off = window.kibo.onState(load);
    return () => {
      active = false;
      off();
    };
  }, []);

  return state;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
