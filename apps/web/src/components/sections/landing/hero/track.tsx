export function Track() {
  return (
    <div
      aria-hidden="true"
      className="relative h-14 overflow-hidden"
      style={{
        background:
          "linear-gradient(var(--brand-deep),var(--brand-deep)) 0 36px/100% 5px no-repeat, repeating-linear-gradient(90deg,#6b4f3a 0 10px,transparent 10px 28px) 0 42px/100% 10px no-repeat",
      }}
    >
      <div className="absolute inset-x-0 top-[30px] h-[3px] bg-brand-deep" />
      <svg
        viewBox="0 0 320 44"
        className="animate-train absolute bottom-3.5 -left-[340px] w-[320px]"
      >
        <rect x="2" y="6" width="96" height="30" rx="6" fill="#00694b" />
        <rect x="104" y="6" width="96" height="30" rx="6" fill="#00694b" />
        {[10, 30, 50, 70, 112, 132, 152, 172].map((x) => (
          <rect
            key={x}
            x={x}
            y="12"
            width="14"
            height="12"
            rx="2"
            fill="#e3f1ea"
          />
        ))}
        <rect x="2" y="28" width="96" height="4" fill="#e2263b" />
        <rect x="104" y="28" width="96" height="4" fill="#e2263b" />
        <path d="M206 36V10q0-4 4-4h60q10 0 22 14l10 6v10z" fill="#e2263b" />
        <path d="M262 11h16l10 9h-26z" fill="#e3f1ea" />
        {[30, 76, 132, 178, 232, 288].map((x) => (
          <circle key={x} cx={x} cy="38" r="5" fill="#06382b" />
        ))}
      </svg>
    </div>
  );
}
