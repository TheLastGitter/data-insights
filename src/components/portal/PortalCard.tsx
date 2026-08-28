import { SOURCES } from "@/lib/types";
import type { ReportEvent } from "@/lib/types";

function SourceLine({ event, onDark = false }: { event: ReportEvent; onDark?: boolean }) {
  const meta = SOURCES[event.source];
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.accent }} />
      <span className={onDark ? "text-white" : undefined} style={onDark ? undefined : { color: meta.accent }}>{meta.label}</span>
      <span className={onDark ? "text-white/70" : "text-muted"}>
        {new Date(event.publishedAt).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </span>
    </div>
  );
}

function Photo({
  event,
  className,
}: {
  event: ReportEvent;
  className: string;
}) {
  const meta = SOURCES[event.source];
  if (event.imageUrl) {
    return (
      // Feed/API thumbnail; unknown CDNs, so native img rather than next/image.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={event.imageUrl}
        alt=""
        className={className}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className={`flex items-end p-4 ${className}`}
      style={{ background: `${meta.accent}22` }}
    >
      <span className="text-sm font-semibold" style={{ color: meta.accent }}>
        {meta.label}
      </span>
    </div>
  );
}

export function PortalCard({
  event,
  variant = "tile",
}: {
  event: ReportEvent;
  variant?: "hero" | "row" | "tile";
}) {
  if (variant === "hero") {
    return (
      <article className="group relative min-h-[340px] overflow-hidden bg-navy-deep sm:min-h-[420px]">
        <a href={event.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
          <Photo
            event={event}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        </a>
        <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
          <SourceLine event={event} onDark />
          <h2 className="mt-3 max-w-3xl font-serif-display text-3xl font-semibold leading-tight text-balance sm:text-4xl">
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              {event.title}
            </a>
          </h2>
          {event.excerpt ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 line-clamp-2">
              {event.excerpt}
            </p>
          ) : null}
        </div>
      </article>
    );
  }

  if (variant === "row") {
    return (
      <article className="group grid grid-cols-[112px_minmax(0,1fr)] gap-3 border-b border-rule py-3 last:border-b-0">
        <a href={event.url} target="_blank" rel="noopener noreferrer" className="overflow-hidden">
          <Photo
            event={event}
            className="h-[74px] w-full object-cover transition group-hover:opacity-90"
          />
        </a>
        <div className="min-w-0">
          <SourceLine event={event} />
          <h3 className="mt-1 font-serif-display text-[15px] font-semibold leading-snug text-ink">
            <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo">
              {event.title}
            </a>
          </h3>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-rule bg-surface">
      <a href={event.url} target="_blank" rel="noopener noreferrer" className="overflow-hidden">
        <Photo
          event={event}
          className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      </a>
      <div className="flex flex-1 flex-col p-4">
        <SourceLine event={event} />
        <h3 className="mt-2 font-serif-display text-lg font-semibold leading-snug text-ink">
          <a href={event.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo">
            {event.title}
          </a>
        </h3>
        {event.excerpt ? (
          <p className="mt-2 text-[13px] leading-5 text-ink-soft line-clamp-3">{event.excerpt}</p>
        ) : null}
      </div>
    </article>
  );
}
