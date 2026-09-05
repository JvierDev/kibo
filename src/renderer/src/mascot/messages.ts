import type { ReminderId } from "../../../shared/types";

export interface ReminderMessage {
  title: string;
  body: string;
  done: string;
}

const MESSAGES: Record<
  ReminderId,
  { title: string; done: string; bodies: string[] }
> = {
  water: {
    title: "Hydration check",
    done: "Grab water",
    bodies: [
      "Grab some water.",
      "Your plants are hydrated — are you?",
      "Sip a glass, your brain will thank you.",
      "Hydration station, off you go.",
      "A little water now saves a headache later.",
    ],
  },
  stretch: {
    title: "Stretch time",
    done: "I stretched",
    bodies: [
      "You've been sitting a while.",
      "Roll those shoulders, give your neck a break.",
      "Stand up and reach for something high.",
      "Two minutes of stretching, that's it.",
      "Your spine will be glad you moved.",
    ],
  },
  walk: {
    title: "Walk break",
    done: "I'll walk",
    bodies: [
      "How about a quick walk?",
      "Fresh air resets your focus.",
      "Step away from the screen for a bit.",
      "A short stroll, knee to knees.",
      "You've earned a little walk.",
    ],
  },
};

export function pickMessage(id: ReminderId, index: number): ReminderMessage {
  const m = MESSAGES[id];
  return {
    title: m.title,
    body: m.bodies[index % m.bodies.length],
    done: m.done,
  };
}

export const MILESTONE_COUNTS = [1, 3, 5, 8];

export function milestoneText(count: number): string | null {
  if (!MILESTONE_COUNTS.includes(count)) return null;
  return `🎉 That's ${count} today — on a roll!`;
}
