"use client";

import { List, X } from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/content/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || `${pathname}/` === href;

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" aria-label="Leaning Oak Ranch home" className="brand-link" onClick={() => setOpen(false)}>
          <Image
            src="/wp-content/uploads/2017/09/Leaning-Oak-Rancg-Logo-White.png"
            alt="Leaning Oak Ranch"
            width={1851}
            height={1062}
            priority
          />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={28} weight="light" /> : <List size={30} weight="light" />}
        </button>
      </div>

      <nav
        id="mobile-navigation"
        className={`mobile-nav ${open ? "is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!open}
      >
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} aria-current={isActive(item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
