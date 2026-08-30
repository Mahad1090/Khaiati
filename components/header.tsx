"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Menu, X, Languages, User, ChevronDown, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useLanguage } from "@/lib/i18n/language-context";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type HeaderCustomer = {
  name: string;
  email: string | null;
} | null;

export function Header({ customer }: { customer?: HeaderCustomer }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { t, toggleLanguage } = useLanguage();
  const router = useRouter();

  const navItems = [
    { id: "collections", label: t.nav.services },
    { id: "businesses", label: t.nav.browse },
    { id: "products", label: t.nav.fabrics },
    { id: "how-it-works", label: t.nav.howItWorks },
  ];

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setIsAccountMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/50 [transform:translateZ(0)] [will-change:transform]">
      <nav className="w-full px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between gap-6 h-20 md:h-24">
          {/* Logo - Left */}
          <Link href="/" className="flex flex-shrink-0 items-center">
            <Image
              src="/logo.png"
              alt="Khaiati"
              width={240}
              height={120}
              className="h-16 sm:h-18 md:h-20 lg:h-22 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation - Right (shifted further right with spacing) */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 ml-8 lg:ml-12">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm tracking-[0.2em] uppercase hover:text-accent transition-colors duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {item.label}
              </a>
            ))}

            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors duration-300"
              aria-label="Switch language"
            >
              <Languages className="h-4 w-4" />
              {t.langToggle}
            </button>

            <NotificationBell />

            {customer ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsAccountMenuOpen((open) => !open)}
                  className="flex items-center gap-1.5 text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors duration-300"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[180px] truncate">{customer.name}</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-56 rounded-md border border-border bg-background p-1 shadow-md">
                    <div className="px-2 py-1.5 text-xs text-muted-foreground font-normal uppercase tracking-[0.12em]">
                      Signed in as
                      <div className="text-sm font-medium text-foreground normal-case tracking-normal truncate">
                        {customer.name}
                      </div>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <Link
                      href="/account"
                      className="flex items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setIsAccountMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/account/login"
                className="flex items-center gap-1.5 text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors duration-300"
              >
                <User className="h-4 w-4" />
                Sign In
              </Link>
            )}

            <Button asChild className="h-10 rounded-none px-6 text-xs tracking-[0.2em] uppercase">
              <Link href="/register-business">{t.hero.cta2}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button - Right */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="p-2 min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Switch language"
            >
              <Languages className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 min-h-11 min-w-11 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border py-8 px-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="text-sm tracking-[0.2em] uppercase"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsMenuOpen(false);
                    document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {item.label}
                </a>
              ))}

              {customer ? (
                <>
                  <div className="text-xs text-muted-foreground uppercase tracking-[0.15em]">
                    Signed in as
                    <div className="text-sm text-foreground normal-case tracking-normal mt-0.5">
                      {customer.name}
                    </div>
                  </div>
                  <Link
                    href="/account"
                    className="text-sm tracking-[0.2em] uppercase"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Account
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="text-left text-sm tracking-[0.2em] uppercase text-destructive"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/account/login"
                  className="text-sm tracking-[0.2em] uppercase"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}

              <Button asChild className="h-11 w-full rounded-none text-xs tracking-[0.2em] uppercase">
                <Link href="/register-business" onClick={() => setIsMenuOpen(false)}>
                  {t.hero.cta2}
                </Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}