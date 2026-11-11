const COACH_GREEN = "#0e9a4c";
const COACH_GREEN_DARK = "#0a6e37";
const COACH_WHITE = "#fbfcfb";
const RED = "#e2263b";
const LOCO_BLUE = "#1f4fc4";
const LOCO_BLUE_DARK = "#143687";
const LOCO_CREAM = "#ead9a8";
const LOCO_YELLOW = "#f2b705";
const GLASS = "#d9ece4";
const STEEL = "#24352e";
const BLACK = "#10201a";
const ROOF = "#9fb3aa";

const RAIL_Y = 52;
const COACH_LENGTH = 148;
const COACH_GAP = 6;
const COACH_STARTS = [0, 1, 2].map((i) => i * (COACH_LENGTH + COACH_GAP));
const LOCO_X = COACH_STARTS.length * (COACH_LENGTH + COACH_GAP);

function Wheel({ cx }: { cx: number }) {
  const cy = RAIL_Y - 5;
  return (
    <g className="train-wheel">
      <circle cx={cx} cy={cy} r="5" fill={BLACK} />
      <path
        d={`M${cx - 3.6} ${cy}h7.2M${cx} ${cy - 3.6}v7.2`}
        stroke={ROOF}
        strokeWidth="1.1"
      />
      <circle cx={cx} cy={cy} r="1.6" fill={ROOF} />
    </g>
  );
}

function Bogie({ cx, axles }: { cx: number; axles: number[] }) {
  const first = cx + axles[0];
  const last = cx + axles[axles.length - 1];
  return (
    <>
      <rect
        x={first - 6}
        y={RAIL_Y - 10}
        width={last - first + 12}
        height="5"
        rx="2"
        fill={STEEL}
      />
      {axles.map((a) => (
        <Wheel key={a} cx={cx + a} />
      ))}
    </>
  );
}

function Coach({ x }: { x: number }) {
  const windows = Array.from({ length: 9 }, (_, i) => x + 28 + i * 10.5);
  const band = `M${x} 21h5M${x + 18.5} 22.5l7 7H${x + 122.5}l7-7M${x + 143} 21h5`;
  return (
    <g>
      <rect
        x={x + COACH_LENGTH}
        y="15"
        width={COACH_GAP}
        height="20"
        fill={STEEL}
      />
      <rect
        x={x + COACH_LENGTH}
        y="37"
        width={COACH_GAP}
        height="3"
        fill={BLACK}
      />
      {[30, 70, 110].map((v) => (
        <rect
          key={v}
          x={x + v}
          y="2.6"
          width="10"
          height="2.5"
          rx="1"
          fill={ROOF}
        />
      ))}
      <path
        d={`M${x + 1} 10.5q0-6 7-6h132q7 0 7 6z`}
        fill={COACH_WHITE}
        stroke={ROOF}
        strokeWidth=".8"
      />
      <rect
        x={x}
        y="10"
        width={COACH_LENGTH}
        height="28"
        rx="2"
        fill={COACH_GREEN}
      />
      <rect x={x} y="10" width={COACH_LENGTH} height="1.6" fill={RED} />
      <path d={band} fill="none" stroke={RED} strokeWidth="6" />
      <path d={band} fill="none" stroke={COACH_WHITE} strokeWidth="3.8" />
      {windows.map((w) => (
        <g key={w}>
          <rect
            x={w}
            y="14.5"
            width="7.5"
            height="8"
            rx="1.6"
            fill={COACH_WHITE}
          />
          <path
            d={`M${w + 1} 17.2h5.5M${w + 1} 19.8h5.5`}
            stroke={COACH_GREEN}
            strokeWidth=".5"
            opacity=".55"
          />
        </g>
      ))}
      {[6.5, 131].map((d) => (
        <g key={d}>
          <rect
            x={x + d}
            y="12.5"
            width="10.5"
            height="25.5"
            rx="1"
            fill={COACH_GREEN_DARK}
          />
          <rect
            x={x + d + 2.7}
            y="15"
            width="5"
            height="7.5"
            rx="1"
            fill={GLASS}
          />
          <path
            d={`M${x + d + 1.3} 25v9M${x + d + 9.2} 25v9`}
            stroke={COACH_WHITE}
            strokeWidth=".7"
          />
        </g>
      ))}
      <rect x={x + 2} y="38" width={COACH_LENGTH - 4} height="3" fill={BLACK} />
      <rect x={x + 54} y="41" width="40" height="6" rx="1.5" fill={STEEL} />
      <Bogie cx={x + 26} axles={[-9, 9]} />
      <Bogie cx={x + 122} axles={[-9, 9]} />
    </g>
  );
}

function Locomotive({ x }: { x: number }) {
  const railPosts = [8, 24, 40, 56, 72, 88];
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <circle
          key={i}
          className="train-smoke"
          style={{ animationDelay: `${i * 0.5}s` }}
          cx={x + 61}
          cy="5"
          r="3"
          fill={ROOF}
        />
      ))}
      {[12, 30].map((f) => (
        <rect
          key={f}
          x={x + f}
          y="8"
          width="12"
          height="3"
          rx="1"
          fill={STEEL}
        />
      ))}
      <rect x={x + 58} y="6" width="6" height="5" rx="1" fill={BLACK} />
      <rect x={x + 4} y="11" width="92" height="26" rx="2" fill={LOCO_BLUE} />
      <rect x={x + 4} y="25" width="92" height="12" fill={LOCO_CREAM} />
      {[10, 24, 38, 66, 80].map((d) => (
        <rect
          key={d}
          x={x + d}
          y="13.5"
          width="11"
          height="9.5"
          rx="1"
          fill="none"
          stroke={LOCO_BLUE_DARK}
          strokeWidth=".9"
        />
      ))}
      <rect x={x + 52} y="13" width="10" height="11" rx="1" fill={BLACK} />
      {[15.5, 18.5, 21.5].map((y) => (
        <rect key={y} x={x + 53} y={y} width="8" height=".8" fill={LOCO_BLUE} />
      ))}
      <path
        d={`M${x + 94} 37V7q0-2.5 2.5-2.5h36q2.4 0 3.1 2.3l3 10.2h2.4q1 0 1 1v19z`}
        fill={LOCO_BLUE}
      />
      <path d={`M${x + 94} 25h48v12h-48z`} fill={LOCO_CREAM} />
      <rect x={x + 92} y="3.2" width="42" height="2.6" rx="1.3" fill={ROOF} />
      <rect
        x={x + 100}
        y="9"
        width="12"
        height="11"
        rx="1.5"
        fill={GLASS}
        stroke="#fff"
        strokeWidth="1"
      />
      <rect
        x={x + 116}
        y="8.5"
        width="9"
        height="27.5"
        rx="1"
        fill="none"
        stroke={LOCO_BLUE_DARK}
        strokeWidth=".9"
      />
      <path d={`M${x + 129} 8.5h5l2.6 9h-7.6z`} fill={STEEL} />
      <path d={`M${x + 120} 1.2h7l3-1.2v4l-3-1.2h-7z`} fill={ROOF} />
      <circle cx={x + 116} cy="2.4" r="1.6" fill={RED} />
      <circle cx={x + 141} cy="21.5" r="1.7" fill="#ffe9a3" />
      <text
        x={x + 106}
        y="32.5"
        textAnchor="middle"
        fontSize="5"
        fontWeight="700"
        fill={LOCO_BLUE_DARK}
      >
        3028
      </text>
      <path
        d={`M${x + 8} 37V24.5h80V37${railPosts
          .slice(1, -1)
          .map((r) => `M${x + r} 24.5V37`)
          .join("")}`}
        fill="none"
        stroke="#fff"
        strokeWidth="1.1"
      />
      <rect x={x + 2} y="36" width="141" height="2" fill={LOCO_YELLOW} />
      <rect x={x} y="38" width="144" height="3.5" fill={BLACK} />
      <rect x={x + 56} y="41.5" width="34" height="7" rx="2" fill={STEEL} />
      <path d={`M${x + 136} 38h11.5v4l4.5 ${RAIL_Y - 42.5}h-16z`} fill={RED} />
      <rect x={x + 147} y="39" width="5" height="2.5" fill={BLACK} />
      <Bogie cx={x + 28} axles={[-12, 0, 12]} />
      <Bogie cx={x + 116} axles={[-12, 0, 12]} />
    </g>
  );
}

export function Track() {
  return (
    <div
      aria-hidden="true"
      className="relative h-[76px] overflow-hidden"
      style={{
        background:
          "linear-gradient(var(--brand-deep),var(--brand-deep)) 0 60px/100% 4px no-repeat, repeating-linear-gradient(90deg,#6b4f3a 0 10px,transparent 10px 28px) 0 64px/100% 7px no-repeat",
      }}
    >
      <svg
        viewBox={`0 0 ${LOCO_X + 156} ${RAIL_Y}`}
        className="animate-train absolute bottom-4 -left-[680px] h-14 w-auto max-w-none overflow-visible"
      >
        {COACH_STARTS.map((x) => (
          <Coach key={x} x={x} />
        ))}
        <Locomotive x={LOCO_X} />
      </svg>
    </div>
  );
}
