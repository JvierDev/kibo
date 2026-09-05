import idleImg from "../assets/kibo/idle.png";
import happyImg from "../assets/kibo/happy.png";
import waterImg from "../assets/kibo/water.png";
import stretchImg from "../assets/kibo/stretch.png";
import walkImg from "../assets/kibo/walk.png";
import snoozeImg from "../assets/kibo/snooze.png";
import celebrateImg from "../assets/kibo/celebrate.png";
import sleepImg from "../assets/kibo/sleep.png";

export type KiboState =
  | "idle"
  | "happy"
  | "water"
  | "stretch"
  | "walk"
  | "snooze"
  | "celebrate"
  | "sleep";

const ASSETS: Record<KiboState, string> = {
  idle: idleImg,
  happy: happyImg,
  water: waterImg,
  stretch: stretchImg,
  walk: walkImg,
  snooze: snoozeImg,
  celebrate: celebrateImg,
  sleep: sleepImg,
};

const ANIMATION: Record<KiboState, string> = {
  idle: "anim-idle",
  happy: "anim-idle",
  water: "anim-idle",
  stretch: "anim-nod",
  walk: "anim-idle",
  snooze: "anim-nod",
  celebrate: "anim-celebrate",
  sleep: "",
};

interface KiboMascotProps {
  state?: KiboState;
  className?: string;
  /** Mild entrance animation on mount. */
  animate?: boolean;
  /** Render without the idle-state animation (no movement). */
  static?: boolean;
}

export function KiboMascot({
  state = "idle",
  className = "",
  animate = false,
  static: isStatic = false,
}: KiboMascotProps): React.JSX.Element {
  return (
    <div
      className={`${isStatic ? "" : ANIMATION[state]} ${animate ? "animate-enter" : ""} ${className}`}
      aria-hidden="true"
    >
      <img
        src={ASSETS[state]}
        alt=""
        draggable={false}
        className="h-full w-full select-none object-contain"
      />
    </div>
  );
}
