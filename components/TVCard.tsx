import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Channel {
  id:       string;
  name:     string;
  logo:     string;
  category: string;
  live?:    boolean;
  slug?:    string;
}

interface TVCardProps {
  channel:  Channel;
  focused?: boolean;
  onFocus?: () => void;
  lang:     string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  priority?: boolean;
}

export function TVCard({
  channel,
  focused = false,
  onFocus,
  lang,
  onClick,
  priority = false,
}: TVCardProps) {
  const isFr = lang === 'fr';
  const suffix = isFr ? '-direct' : '-live';
  
  // Si on a un slug, on va vers la page TV optimisée, sinon vers le player générique
  const href = channel.slug 
    ? `/${lang}/tv/${channel.slug}${suffix}`
    : `/${lang}/watch/${channel.id}`;

  const viewersCount = React.useMemo(() => {
    if (!channel.live) return null;
    const hash = channel.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const base = 1500;
    const variance = hash % 4000;
    return Math.floor((base + variance) * 1.3).toLocaleString();
  }, [channel.id, channel.live]);

  const className = [
    'card',
    focused ? 'card--focused' : '',
  ].filter(Boolean).join(' ');

  const ariaLabel = `Regarder ${channel.name} — ${channel.category}${channel.live ? ' — En direct' : ''}`;

  const innerContent = (
    <>
      {/* Badge LIVE */}
      {channel.live && (
        <span
          className="card__badge card__badge--live"
          aria-label="Diffusion en direct"
        >
          En direct
        </span>
      )}

      {/* Image */}
      <div className="card__media">
        <Image
          src={channel.logo}
          alt=""
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
          className="card__image"
          priority={priority}
        />
      </div>

      {/* Contenu textuel */}
      <div className="card__content">
        <h3 className="card__title">{channel.name}</h3>
        {channel.live && viewersCount ? (
          <p className="card__body flex items-center gap-1.5 text-xs text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_6px_rgba(220,38,38,0.8)]" />
            <span className="font-bold">{viewersCount}</span>
            <span className="opacity-70">{isFr ? 'spectateurs' : 'watching now'}</span>
          </p>
        ) : channel.category ? (
          <p className="card__body">{channel.category}</p>
        ) : null}
      </div>
    </>
  );

  if (onClick) {
    return (
      <div
        className={className}
        data-testid="tv-card"
        onMouseEnter={onFocus}
        onClick={onClick as any}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick(e as any);
          }
        }}
        aria-label={ariaLabel}
      >
        {innerContent}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      data-testid="tv-card"
      onMouseEnter={onFocus}
      aria-label={ariaLabel}
    >
      {innerContent}
    </Link>
  );
}

// État squelette — exporté séparément pour usage dans les grilles
export function TVCardSkeleton() {
  return (
    <div
      className="card card--skeleton"
      aria-busy="true"
      aria-label="Chargement de la chaîne"
      role="status"
    >
      <div className="card__media card__media--skeleton" aria-hidden="true" />
      <div className="card__content">
        <div className="card__title--skeleton" aria-hidden="true" />
        <div className="card__body--skeleton"  aria-hidden="true" />
      </div>
    </div>
  );
}
