"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Headphones, Person, Rss, UploadIcon } from "./icons";

const LINKS = [
  { href: "/studio", label: "Dashboard", Icon: Grid },
  { href: "/studio/upload", label: "Upload", Icon: UploadIcon },
  { href: "/studio/import", label: "Podcast feed", Icon: Rss },
  { href: "/studio/profile", label: "Profile", Icon: Person },
] as const;

export function StudioNav() {
  const path = usePathname();
  return (
    <header className="studio-nav">
      <div className="studio-brand">
        <Link href="/studio" className="brand">
          <Image src="/logo-mark.png" alt="" width={26} height={32} />
          <Image src="/logo-wordmark.png" alt="NatureMe" width={104} height={15} />
        </Link>
        <span className="studio-tag">Studio</span>
        <Link href="/" className="studio-switch"><Headphones size={18} />Listener view</Link>
      </div>
      <nav className="studio-tabs" aria-label="Studio">
        {LINKS.map(({ href, label, Icon }) => (
          <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
