import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/seo";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/industries", label: "Industries" },
  { to: "/jobs", label: "Open Roles" },
  { to: "/yard", label: "Yard" },
  { to: "/demand", label: "Demand" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, isPending } = useCurrentUserState();

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.matchMedia("(min-width: 768px)").matches) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-[var(--grok-banner-h,0px)] z-40 border-b border-border/80 bg-bg/95 backdrop-blur-md supports-[backdrop-filter]:bg-bg/85">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-semibold tracking-tight text-primary ring-1 ring-primary/30">
            {SITE.mark}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-fg sm:text-[15px]">
              {SITE.name}
            </span>
            <span className="hidden max-w-[14rem] truncate text-[11px] leading-tight text-muted sm:block">
              {SITE.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
              activeProps={{ className: "text-fg bg-elevated" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/portal"
            className="rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10 hover:text-primary"
            activeProps={{ className: "bg-primary/15 text-primary" }}
          >
            Portal
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {isPending ? (
            <div className="h-10 w-20 animate-pulse rounded-md bg-elevated" />
          ) : user ? (
            <SignedIn>
              <Button asChild size="sm" variant="outline" className="hidden min-h-10 sm:inline-flex">
                <Link to="/portal">Portal</Link>
              </Button>
              <UserButton />
            </SignedIn>
          ) : (
            <SignedOut>
              <Button asChild size="sm" variant="outline" className="hidden min-h-10 sm:inline-flex">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="min-h-10 border-0 bg-[#3d8ec4] text-white hover:bg-[#4a9fd4]"
              >
                <Link to="/portal">Portal</Link>
              </Button>
            </SignedOut>
          )}
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-md border border-border text-fg md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-bg md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          aria-label="Mobile"
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-3.5 text-base text-fg hover:bg-elevated active:bg-elevated"
              activeProps={{ className: "bg-elevated text-primary" }}
            >
              {item.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <Button
              asChild
              className="h-12 w-full border-0 bg-[#3d8ec4] text-base text-white hover:bg-[#4a9fd4]"
            >
              <Link to="/portal" onClick={() => setOpen(false)}>
                Client portal
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 w-full text-base">
              <Link to="/login" onClick={() => setOpen(false)}>
                Sign in
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-12 w-full text-base">
              <Link to="/contact" onClick={() => setOpen(false)}>
                Hire talent
              </Link>
            </Button>
            <a
              href={`tel:${SITE.phoneE164}`}
              className="py-2 text-center text-sm text-muted hover:text-primary"
            >
              Call {SITE.phone}
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
