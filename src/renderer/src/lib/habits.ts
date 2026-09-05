import { Droplets, PersonStanding, Footprints } from "lucide-react";
import type { ReminderId } from "../../../shared/types";

export const HABIT_GOAL = 8;

export interface HabitMeta {
  id: ReminderId;
  label: string;
  description: string;
  icon: typeof Droplets;
  color: string;
}

export const HABITS: HabitMeta[] = [
  {
    id: "water",
    label: "Water",
    description: "Keep your body hydrated",
    icon: Droplets,
    color: "var(--accent-cyan)",
  },
  {
    id: "stretch",
    label: "Stretch",
    description: "Loosen up, avoid tension",
    icon: PersonStanding,
    color: "var(--accent-coral)",
  },
  {
    id: "walk",
    label: "Walk",
    description: "Move a little, make a big difference",
    icon: Footprints,
    color: "var(--accent-teal)",
  },
];
