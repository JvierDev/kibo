import { useEffect, useRef, useState } from "react";
import { X, Droplets, PersonStanding, Footprints } from "lucide-react";
import { KiboMascot, type KiboState } from "../components/KiboMascot";
import type {
  ReactionEvent,
  ReminderAction,
  ReminderId,
} from "../../../shared/types";
import { milestoneText, pickMessage } from "./messages";

const BASE_MASCOT: Record<ReminderId, KiboState> = {
  water: "water",
  stretch: "stretch",
  walk: "walk",
};

const REMINDER_ICON: Record<ReminderId, typeof Droplets> = {
  water: Droplets,
  stretch: PersonStanding,
  walk: Footprints,
};

const REMINDER_ICON_COLOR: Record<ReminderId, string> = {
  water: "var(--accent-cyan)",
  stretch: "var(--accent-coral)",
  walk: "var(--accent-teal)",
};

function playChime(): void {
  const ctx = new AudioContext();
  const notes = [880, 1318.52];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.8);
  });
}

function reactionText(event: ReactionEvent): string {
  if (event.action === "done") {
    const milestone = event.count ? milestoneText(event.count) : null;
    return milestone ?? "Nice! 🎉";
  }
  if (event.action === "snooze") return "I'll remind you shortly.";
  return "No problem.";
}

export function Mascot(): React.JSX.Element {
  const [reminder, setReminder] = useState<ReminderId | null>(null);
  const [reaction, setReaction] = useState<ReactionEvent | null>(null);
  const reminderRef = useRef<ReminderId | null>(null);
  const shownCount = useRef<Record<ReminderId, number>>({
    water: 0,
    stretch: 0,
    walk: 0,
  });

  useEffect(() => {
    let mounted = true;
    window.kibo.getState().then((state) => {
      if (mounted && state.activeReminder) {
        reminderRef.current = state.activeReminder;
        setReminder(state.activeReminder);
      }
    });
    const offReminder = window.kibo.onReminder((id) => {
      if (!mounted) return;
      playChime();
      shownCount.current[id] += 1;
      reminderRef.current = id;
      setReaction(null);
      setReminder(id);
    });
    const offReaction = window.kibo.onReaction((event) => {
      if (mounted && reminderRef.current) setReaction(event);
    });
    return () => {
      mounted = false;
      offReminder();
      offReaction();
    };
  }, []);

  if (!reminder) return <div className="h-full w-full" />;

  const mascotState: KiboState = reaction
    ? reaction.action === "done"
      ? "celebrate"
      : reaction.action === "snooze"
        ? "snooze"
        : "idle"
    : BASE_MASCOT[reminder];

  const message = pickMessage(reminder, shownCount.current[reminder]);
  const Icon = REMINDER_ICON[reminder];
  const iconColor = REMINDER_ICON_COLOR[reminder];

  const respond = (action: ReminderAction): void => {
    if (reaction) return;
    setReaction({ action, id: reminder });
    void window.kibo.respondReminder(reminder, action);
  };

  return (
    <div className="relative flex h-full w-full select-none items-end justify-center p-3">
      {/* Dark floating card */}
      <div className="anim-popup relative w-full max-w-100 rounded-[22px] border border-[rgba(110,160,210,0.25)] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.85)]">
        {/* Gradient background */}
        <div
          className="absolute inset-0 rounded-[22px]"
          style={{
            background:
              "linear-gradient(160deg, #0d1b2f 0%, #0b1628 55%, #06101f 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[22px]"
          style={{
            background:
              "radial-gradient(90% 80% at 20% 0%, rgba(32,213,221,0.10) 0%, transparent 55%)",
          }}
        />

        <div className="relative px-6 pt-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${iconColor}1f`, color: iconColor }}
              >
                <Icon size={18} />
              </span>
              <h2 className="text-[15px] font-bold text-(--text-primary)">
                {reaction ? reactionText(reaction) : message.title}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => respond("skip")}
              className="btn-focus -mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-(--text-muted) transition hover:bg-white/5 hover:text-(--text-primary)"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body */}
          {!reaction && (
            <>
              <p className="mt-2.5 text-[13px] leading-relaxed text-(--text-secondary)">
                {message.body}
              </p>
              <p className="mt-1 text-[11px] text-(--text-muted)">
                Take a moment — it will boost your focus and energy.
              </p>
            </>
          )}
        </div>

        {/* Footer: actions + Kibo */}
        <div className="relative flex items-end justify-between gap-3 px-6 pb-4 pt-3">
          {!reaction ? (
            <div className="flex min-w-0 shrink flex-col gap-1.5">
              <button
                type="button"
                onClick={() => respond("done")}
                className="btn-focus w-full rounded-xl bg-linear-to-r from-(--accent-cyan) to-(--accent-cyan-strong) px-4 py-2 text-[13px] font-semibold text-[#02131b] transition hover:brightness-110"
              >
                {message.done}
              </button>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => respond("snooze")}
                  className="btn-focus flex-1 rounded-xl border border-(--border-strong) bg-white/5 px-3 py-1.5 text-[12px] font-medium text-(--text-secondary) transition hover:bg-white/10 hover:text-(--text-primary)"
                >
                  +5 min
                </button>
                <button
                  type="button"
                  onClick={() => respond("skip")}
                  className="btn-focus flex-1 rounded-xl px-3 py-1.5 text-[12px] font-medium text-(--text-muted) transition hover:text-(--text-secondary)"
                >
                  Skip
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <div className="pointer-events-none flex h-28 w-28 shrink-0 items-end justify-end">
            <KiboMascot state={mascotState} className="h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
