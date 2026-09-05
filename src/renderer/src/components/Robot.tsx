export type RobotVariant = "idle" | "celebrate" | "nod" | "shrug";

const VARIANT_CLASS: Record<RobotVariant, string> = {
  idle: "robot-idle",
  celebrate: "robot-celebrate",
  nod: "robot-nod",
  shrug: "robot-shrug",
};

interface RobotProps {
  variant?: RobotVariant;
  className?: string;
}

export function Robot({
  variant = "idle",
  className = "",
}: RobotProps): React.JSX.Element {
  return (
    <div
      className={`${VARIANT_CLASS[variant]} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 140 160" className="h-full w-full">
        <ellipse
          cx="70"
          cy="150"
          rx="24"
          ry="5"
          fill="#000000"
          opacity="0.12"
        />
        <line
          x1="70"
          y1="38"
          x2="70"
          y2="22"
          stroke="#93c5fd"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="70" cy="16" r="5" fill="#fbbf24">
          <animate
            attributeName="opacity"
            values="1;0.4;1"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <rect x="45" y="38" width="50" height="44" rx="14" fill="#93c5fd" />
        <circle cx="61" cy="58" r="5" fill="#0f172a" />
        <circle cx="79" cy="58" r="5" fill="#0f172a" />
        <path
          d="M60 70 Q70 77 80 70"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <rect x="38" y="96" width="9" height="24" rx="5" fill="#bfdbfe" />
        <rect x="93" y="96" width="9" height="24" rx="5" fill="#bfdbfe" />
        <rect x="53" y="86" width="34" height="44" rx="12" fill="#bfdbfe" />
        <circle cx="70" cy="106" r="7" fill="#e0f2fe" />
        <rect x="60" y="130" width="8" height="16" rx="4" fill="#93c5fd" />
        <rect x="72" y="130" width="8" height="16" rx="4" fill="#93c5fd" />
      </svg>
    </div>
  );
}
