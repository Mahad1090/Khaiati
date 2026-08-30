"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/language-context";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer id="contact" className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6">
        {/* Main footer */}
        <div className="py-10 md:py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {/* Brand */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="Khaiati"
                width={80}
                height={80}
                className="h-18 w-18 md:h-20 md:w-20 object-contain"
              />
              <h2 className="font-serif text-2xl md:text-3xl tracking-[0.2em]">KHAIATI</h2>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-xs">
              {t.footer.tagline}
            </p>

            {/* Social */}
            <div className="flex gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground hover:text-primary transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground hover:text-primary transition-colors duration-300"
                aria-label="Pinterest"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-primary-foreground/30 flex items-center justify-center hover:bg-primary-foreground hover:text-primary transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-6">
            <h3 className="text-sm tracking-[0.2em] uppercase">{t.footer.forCustomers}</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link href="#businesses" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.browseBusinesses}
                </Link>
              </li>
              <li>
                <Link href="#collections" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.services}
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.howItWorks}
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.orderTracking}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm tracking-[0.2em] uppercase">{t.footer.forBusinesses}</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link href="#businesses" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.listYourBusiness}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.pricing}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.businessDashboard}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.employeeManagement}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm tracking-[0.2em] uppercase">{t.footer.support}</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.contactUs}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.faq}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.shippingReturns}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.careGuide}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
                  {t.footer.bookAppointment}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/50">
          <p>{t.footer.copyright}</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
              {t.footer.legalNotice}
            </Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
              {t.footer.privacyPolicy}
            </Link>
            <Link href="#" className="hover:text-primary-foreground transition-colors duration-300">
              {t.footer.cookies}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
