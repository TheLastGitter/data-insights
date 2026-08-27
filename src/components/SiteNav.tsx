import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-navy-deep/95 text-white backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center border border-gold/70 text-sm font-semibold text-gold transition group-hover:bg-gold group-hover:text-navy-deep">
            DI
          </span>
          <span className="font-serif-display text-xl font-semibold tracking-tight">
            Data<span className="text-gold">Insights</span>
          </span>
        </Link>
        <div className="hidden items-center gap-1 text-sm lg:flex">
          <NavLink href="/">Overview</NavLink>
          <NavLink href="/report">Daily</NavLink>
          <NavLink href="/weekly">Weekly</NavLink>
          <NavLink href="/command-center">Command</NavLink>
          <NavLink href="/history">History</NavLink>
          <NavLink href="/#sources">Sources</NavLink>
          <NavLink href="/#topics">Themes</NavLink>
        </div>
        <div className="hidden items-center gap-2 sm:flex lg:hidden">
          <NavLink href="/report">Daily</NavLink>
          <NavLink href="/weekly">Weekly</NavLink>
          <NavLink href="/command-center">Command</NavLink>
        </div>
        <Link href="/command-center" className="ml-3 inline-flex items-center gap-2 border border-gold/50 px-3 py-2 text-xs font-medium text-gold transition hover:bg-gold hover:text-navy-deep sm:hidden">
          Command →
        </Link>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-sm px-3 py-2 text-white/65 transition hover:bg-white/10 hover:text-gold"
    >
      {children}
    </Link>
  );
}
