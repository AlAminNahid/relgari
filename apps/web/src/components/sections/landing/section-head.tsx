export function SectionHead({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="mb-10 max-w-[640px]">
      <div className="font-mono text-[12.5px] font-medium uppercase tracking-[.1em] text-primary">
        {eyebrow}
      </div>
      <h2 className="mb-3 mt-2.5 text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-tight text-brand-deep text-balance">
        {title}
      </h2>
      {body ? <p className="text-lg text-muted-foreground">{body}</p> : null}
    </div>
  );
}
