"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { trackEvent, type AnalyticsEvent } from "@/lib/analytics";

type Props = ComponentProps<typeof Link> & {
  event: AnalyticsEvent;
  children: ReactNode;
};

export function TrackedLink({ event, onClick, children, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(clickEvent) => {
        trackEvent(event);
        onClick?.(clickEvent);
      }}
    >
      {children}
    </Link>
  );
}
