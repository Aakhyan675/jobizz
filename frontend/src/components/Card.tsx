import type { ReactNode, CSSProperties } from "react";
import { clsx } from "clsx";

export function Card({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div style={style} className={clsx("rounded-2xl border border-slate-200 bg-white shadow-card", className)}>
      {children}
    </div>
  );
}
