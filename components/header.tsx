"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Languages, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useLanguage } from "@/lib/i18n/language-context";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, toggleLanguage } = useLanguage();

  const navItems = [
    { id: "collections", label: t.nav.services },
    { id: "businesses", label: t.nav.browse },
    { id: "products", label: t.nav.fabrics },
    { id: "how-it-works", label: t.nav.howItWorks },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <nav className="max-w-[1800px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between gap-6 h-16 md:h-20">
          {/* Logo - Left */}
          <Link href="/" className="flex flex-shrink-0 items-center gap-3">
            <Image
              src="/logo.png"
              alt="Khaiati"
              width={64}
              height={64}
              className="h-12 w-12 md:h-16 md:w-16 object-contain"
              priority
            />
            <h1 className="font-serif text-xl md:text-2xl tracking-[0.2em] text-foreground">
              KHAIATI
            </h1>
          </Link>

          {/* Desktop Navigation - Right */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
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

            <Link
              href="/account"
              className="flex items-center gap-1.5 text-sm tracking-[0.15em] uppercase hover:text-accent transition-colors duration-300"
            >
              <User className="h-4 w-4" />
              Account
            </Link>

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
              <Link
                href="/account"
                className="text-sm tracking-[0.2em] uppercase"
                onClick={() => setIsMenuOpen(false)}
              >
                Account
              </Link>
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
