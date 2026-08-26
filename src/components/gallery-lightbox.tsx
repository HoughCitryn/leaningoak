"use client";

import { ArrowLeft, ArrowRight, X } from "@phosphor-icons/react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryImage } from "@/content/types";
import { trackEvent } from "@/lib/analytics";

export function GalleryLightbox({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  function open(index: number) {
    previousFocus.current = document.activeElement as HTMLElement;
    setActive(index);
    trackEvent("gallery_open", { image_index: index + 1 });
  }

  const close = useCallback(() => {
    setActive(null);
    requestAnimationFrame(() => previousFocus.current?.focus());
  }, []);

  const move = useCallback((direction: -1 | 1) => {
    setActive((current) => current === null ? current : (current + direction + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (active === null) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
      if (event.key === "Tab") {
        const controls = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
        if (!controls.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("lightbox-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("lightbox-open");
    };
  }, [active, close, move]);

  return (
    <>
      <div className="gallery-grid">
        {images.map((item, index) => (
          <button key={item.src} type="button" className="gallery-tile" onClick={() => open(index)} aria-label={`Open image: ${item.alt}`}>
            <Image
              src={item.src}
              alt={item.alt}
              width={item.width}
              height={item.height}
              sizes="(max-width: 767px) 100vw, (max-width: 980px) 50vw, 33vw"
            />
          </button>
        ))}
      </div>

      {active !== null ? (
        <div ref={dialogRef} className="lightbox" role="dialog" aria-modal="true" aria-label="Photo gallery viewer" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <button ref={closeRef} type="button" className="lightbox-close" onClick={close} aria-label="Close gallery"><X size={28} /></button>
          <button type="button" className="lightbox-prev" onClick={() => move(-1)} aria-label="Previous image"><ArrowLeft size={32} /></button>
          <figure>
            <Image
              src={images[active].src}
              alt={images[active].alt}
              width={images[active].width}
              height={images[active].height}
              sizes="90vw"
              priority
            />
            <figcaption>{images[active].alt}</figcaption>
          </figure>
          <button type="button" className="lightbox-next" onClick={() => move(1)} aria-label="Next image"><ArrowRight size={32} /></button>
        </div>
      ) : null}
    </>
  );
}
