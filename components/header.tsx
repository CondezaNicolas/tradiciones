"use client";

import { useEffect, useRef, useState } from "react";

import { SiteBrand } from "@/components/site-brand";

const sections = ["ediciones-recientes", "conectemos-en-persona"] as const;

const navLinks = [
  { label: "Inicio", href: "/" },
  { label: "Ediciones", href: "/#ediciones-recientes", id: "ediciones-recientes" },
  { label: "Contacto", href: "/#conectemos-en-persona", id: "conectemos-en-persona" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const isClickScrolling = useRef(false);

  useEffect(() => {
    const sectionEls = sections
      .flatMap((id) => {
        const el = document.getElementById(id);
        return el ? [el] : [];
      });

    if (sectionEls.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveSection(visible.target.id);
        } else {
          const anyVisible = sectionEls.some((el) => {
            const rect = el.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
          });
          if (!anyVisible) setActiveSection(null);
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
    id?: string
  ) => {
    setIsMenuOpen(false);
    const hash = href.split("#")[1];
    if (!hash) return;
    e.preventDefault();
    const el = document.getElementById(hash);
    if (!el) return;

    isClickScrolling.current = true;
    setActiveSection(id ?? hash);
    el.scrollIntoView({ behavior: "smooth" });

    window.history.pushState(null, "", href);
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 1000);
  };

  const isActive = (link: (typeof navLinks)[number]) => {
    if (link.id) return activeSection === link.id;
    return activeSection === null;
  };

  return (
    <nav className="fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-md shadow-[0_32px_64px_-15px_rgba(26,28,28,0.04)]">
      <div className="flex w-full items-center justify-between px-1 py-5 sm:px-2 lg:px-3">
        <div className="flex items-center gap-8 lg:gap-10">
          <SiteBrand />
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className={`font-body text-sm tracking-wide cursor-pointer ${
                  isActive(link)
                    ? "border-b-2 border-secondary pb-1 text-secondary"
                    : "text-on-surface hover:text-primary transition-opacity duration-300"
                }`}
                href={link.href}
                onClick={(e) => handleClick(e, link.href, link.id)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Menú"
          >
            <span className="material-symbols-outlined">
              {isMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/20 bg-surface px-8 py-4">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                className={`font-body text-sm tracking-wide cursor-pointer ${
                  isActive(link) ? "text-secondary" : "text-on-surface"
                }`}
                href={link.href}
                onClick={(e) => handleClick(e, link.href, link.id)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
