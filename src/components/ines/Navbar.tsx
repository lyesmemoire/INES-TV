import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="navbar" role="navigation" aria-label="Navigation principale">
      <Image
        src="/assets/logo-ines-tv.svg"
        alt="INES TV"
        width={120}
        height={40}
        className="navbar__logo"
        priority
      />
      <div className="navbar__links">
        <Link href="/">Accueil</Link>
        <Link href="/live">En direct</Link>
        <Link href="/sports">Sports</Link>
        <Link href="/login">Connexion</Link>
        <button className="navbar__btn" aria-label="S'abonner à INES TV">
          S&apos;abonner
        </button>
      </div>
    </nav>
  );
}
