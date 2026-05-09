"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function Footer({ lang }: { lang?: string }) {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="footer">
      <div className="container mx-auto px-4">
        
        <div className="footer__grid">
          
          <div>
            <h3 className="footer__title">GOALA TV</h3>
            <p className="footer__description">
              Plateforme de streaming sports & TV en temps réel
            </p>
          </div>

          <div>
            <h4 className="footer__heading">Navigation</h4>
            <ul className="footer__list">
              <li><Link href={`/${lang}/live`} className="footer__link">Live TV</Link></li>
              <li><Link href={`/${lang}/live-matches`} className="footer__link">Matches</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Sports</h4>
            <ul className="footer__list" style={{ color: 'var(--color-text-inverse)' }}>
              <li>Football</li>
              <li>Basketball</li>
              <li>Tennis</li>
            </ul>
          </div>

          <div>
            <h4 className="footer__heading">Legal</h4>
            <ul className="footer__list">
              <li><Link href={`/${lang}/login`} className="footer__link">Login</Link></li>
            </ul>
          </div>

        </div>

        <div className="footer__bottom">
          <p>© {year ?? ""} GOALA TV</p>
        </div>
      </div>
    </footer>
  );
}
