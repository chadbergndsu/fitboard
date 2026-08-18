import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "@/lib/seo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
              {SITE.mark}
            </span>
            <span className="text-sm font-semibold">{SITE.name}</span>
          </div>
          <p className="text-sm font-medium text-primary">{SITE.tagline}</p>
          <p className="max-w-sm text-sm leading-relaxed text-fg/85">
            {SITE.hook}
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Recruiter OS for construction, engineering, architecture, and
            accounting desks.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Navigate
          </h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-1">
            <li>
              <Link
                to="/industries"
                className="inline-flex min-h-11 items-center text-fg/90 hover:text-primary"
              >
                Industries
              </Link>
            </li>
            <li>
              <Link
                to="/jobs"
                className="inline-flex min-h-11 items-center text-fg/90 hover:text-primary"
              >
                Open roles
              </Link>
            </li>
            <li>
              <Link
                to="/portal"
                className="inline-flex min-h-11 items-center text-fg/90 hover:text-primary"
              >
                Portal
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="inline-flex min-h-11 items-center text-fg/90 hover:text-primary"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center text-fg/90 hover:text-primary"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">
            Contact
          </h3>
          <ul className="space-y-1 text-sm text-fg/90">
            <li>
              <a
                href={`tel:${SITE.phoneE164}`}
                className="flex min-h-11 items-center gap-2 hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="flex min-h-11 items-start gap-2 break-all hover:text-primary sm:items-center sm:break-normal"
              >
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary sm:mt-0" />
                {SITE.email}
              </a>
            </li>
            <li className="flex items-start gap-2 py-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{SITE.address}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <span className="text-muted/90">
            Owned systems · Local expertise · Upper Midwest
          </span>
        </div>
      </div>
    </footer>
  );
}
