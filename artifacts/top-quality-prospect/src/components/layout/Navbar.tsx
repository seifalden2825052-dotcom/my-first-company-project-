import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import logoPath from "@assets/1.png";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useListPages, getListPagesQueryKey } from "@workspace/api-client-react";

const navLinks = [
  { href: "/", label: "HOME" },
  { href: "/about", label: "ABOUT" },
  { href: "/ndt", label: "NDT" },
  { href: "/training", label: "TRAINING" },
  { href: "/services", label: "SERVICES" },
  { href: "/certificates", label: "CERTIFICATES" },
  { href: "/contact", label: "CONTACT US" },
];

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: pages } = useListPages({
    query: { retry: false, queryKey: getListPagesQueryKey() },
  });
  const dynamicLinks = (pages ?? [])
    .filter((p) => p.published)
    .map((p) => ({ href: `/p/${p.slug}`, label: p.title.toUpperCase() }));

  const allLinks = [...navLinks, ...dynamicLinks];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto px-4 md:px-6 h-32 md:h-40 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img
            src={logoPath}
            alt="Top Quality Prospect Logo"
            className="h-28 md:h-36 w-auto object-contain"
            data-testid="img-navbar-logo"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7 flex-wrap justify-end">
          {allLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-display font-semibold tracking-wider transition-colors hover:text-primary",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-background">
          <div className="flex flex-col px-4 py-4 space-y-4">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-sm font-display font-semibold tracking-wider transition-colors py-2 border-b border-white/5",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
