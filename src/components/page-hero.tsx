import type { CSSProperties, ReactNode } from "react";

export function PageHero({
  title,
  eyebrow,
  image,
  children,
  compact = false,
}: {
  title: string;
  eyebrow?: string;
  image: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={`page-hero ${compact ? "page-hero-compact" : ""}`}
      style={{ "--hero-image": `url("${image}")` } as CSSProperties}
    >
      <div className="hero-overlay" />
      <div className="hero-content">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {children}
      </div>
    </section>
  );
}
