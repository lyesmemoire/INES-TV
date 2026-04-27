import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="hero" aria-label="Bannière principale">
      <Image
        className="hero__img"
        src="https://images.unsplash.com/photo-1517649763962-0c623066013b?fit=crop&w=1200&q=80"
        alt="Sport Banner"
        fill
        sizes="100vw"
        priority
      />
      <div className="hero__overlay">
        <h1>Regardez le meilleur du sport en direct</h1>
        <p>Football, boxe, basketball et plus encore en streaming sur INES TV.</p>
        <button className="hero__btn" aria-label="Essayer INES TV maintenant">
          Essayer maintenant
        </button>
      </div>
    </section>
  );
}
