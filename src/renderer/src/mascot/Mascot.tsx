import { useEffect, useState } from "react";
import { Robot, type RobotVariant } from "../components/Robot";
import type { ReminderAction, ReminderId } from "../../../shared/types";

const MESSAGES: Record<
  ReminderId,
  { title: string; body: string; done: string }
> = {
  water: {
    title: "Hydration check",
    body: "Grab some water.",
    done: "Grab water",
  },
  stretch: {
    title: "Stretch time",
    body: "You've been sitting a while.",
    done: "I stretched",
  },
  walk: {
    title: "Walk break",
    body: "How about a quick walk?",
    done: "I'll walk",
  },
};

const REACTIONS: Record<
  ReminderAction,
  { text: string; variant: RobotVariant }
> = {
  done: { text: "Nice!", variant: "celebrate" },
  snooze: { text: "I'll remind you shortly.", variant: "nod" },
  skip: { text: "No problem.", variant: "shrug" },
};

function Bubble({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="relative rounded-3xl bg-white/95 px-5 py-4 text-slate-900 shadow-xl shadow-slate-900/20 bubble-in">
      {children}
      <div className="absolute -bottom-1.5 right-10 h-4 w-4 rotate-45 bg-white/95" />
    </div>
  );
}

export function Mascot(): React.JSX.Element {
  const [reminder, setReminder] = useState<ReminderId | null>(null);
  const [reaction, setReaction] = useState<{
    action: ReminderAction;
    id: ReminderId;
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    window.kibo.getState().then((state) => {
      if (mounted && state.activeReminder) setReminder(state.activeReminder);
    });
    const offReminder = window.kibo.onReminder((id) => {
      if (mounted) setReminder(id);
    });
    return () => {
      mounted = false;
      offReminder();
    };
  }, []);

  if (!reminder) return <div className="h-full w-full" />;

  const variant = reaction ? REACTIONS[reaction.action].variant : "idle";
  const message = MESSAGES[reminder];

  const respond = (action: ReminderAction): void => {
    if (reaction) return;
    setReaction({ action, id: reminder });
    void window.kibo.respondReminder(reminder, action);
  };

  return (
    <div className="relative h-full w-full select-none">
      <div className="absolute bottom-16 right-3 left-3">
        <Bubble>
          <p className="text-sm font-semibold">
            {reaction ? (
              REACTIONS[reaction.action].text
            ) : (
              <>
                {message.title}
                <span className="font-normal text-slate-500">
                  {" "}
                  — {message.body}
                </span>
              </>
            )}
          </p>
          {!reaction && (
            <div className="mt-3 flex items-center gap-2">
              <button
                className="rounded-xl bg-sky-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-sky-600"
                onClick={() => respond("done")}
              >
                {message.done}
              </button>
              <button
                className="rounded-xl bg-slate-200 px-3 py-1.5 text-sm font-medium transition hover:bg-slate-300"
                onClick={() => respond("snooze")}
              >
                +5 min
              </button>
              <button
                className="rounded-xl px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:text-slate-600"
                onClick={() => respond("skip")}
              >
                Skip
              </button>
            </div>
          )}
        </Bubble>
      </div>
      <div className="absolute right-6 bottom-0 h-32 w-28">
        <Robot variant={variant} className={`h-full w-full robot-enter`} />
      </div>
    </div>
  );
}
