import { Heart } from "lucide-react";
import { KiboMascot } from "../components/KiboMascot";

export function AboutPage(): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6">
      <div className="glass-card anim-rise flex w-full max-w-sm flex-col items-center p-8 text-center">
        <div className="pointer-events-none h-40 w-40">
          <KiboMascot state="idle" className="h-full w-full" />
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-(--text-primary)">
          Kibo
        </h1>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Your healthy-work companion
        </p>

        <p className="mt-4 text-sm leading-relaxed text-(--text-muted)">
          Kibo is a friendly desktop companion that helps you build healthier
          habits while working.
        </p>

        <span className="mt-5 rounded-full border border-(--border) bg-(--surface) px-3 py-1 text-xs text-(--text-secondary)">
          Version 0.2.0
        </span>

        <div className="mt-6 flex items-center gap-1.5 text-(--accent-coral)">
          <Heart size={13} className="fill-current" />
          <span className="text-xs text-(--text-muted)">
            Better habits. A healthier you.
          </span>
        </div>
      </div>
    </div>
  );
}
