import Image from "next/image";

interface CarouselItem {
  id: number;
  title: string;
  image: string;
}

interface CarouselProps {
  title: string;
  items: CarouselItem[];
}

export default function Carousel({ title, items }: CarouselProps) {
  return (
    <section className="carousel-section" aria-label={title}>
      <h2>{title}</h2>
      <div className="carousel">
        {items.map((item) => (
          <div key={item.id} className="carousel__item" tabIndex={0} role="button">
            <Image
              src={item.image}
              alt={item.title}
              width={220}
              height={140}
              loading="lazy"
              sizes="(max-width: 700px) 140px, 220px"
            />
            <p>{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
