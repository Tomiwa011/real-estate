import { useState } from "react";
import { getPropertyImage } from "../utils/format";

function PropertyGallery({ images, title, property }) {
  const list = images && images.length > 0 ? images : [null];

  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});

  const srcFor = (index) =>
    getPropertyImage(
      { ...property, images: list },
      index,
      Boolean(failed[index]),
    );

  const markFailed = (index) =>
    setFailed((prev) => ({ ...prev, [index]: true }));

  const go = (step) =>
    setActive((current) => (current + step + list.length) % list.length);

  const arrowClass =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

  return (
    <div>
      <div className="relative aspect-[10/7] overflow-hidden rounded-lg bg-mist">
        <img
          src={srcFor(active)}
          alt={`${title}, photo ${active + 1} of ${list.length}`}
          onError={() => markFailed(active)}
          className="h-full w-full object-cover"
        />

        {list.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className={`${arrowClass} left-3`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className={`${arrowClass} right-3`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="absolute bottom-3 right-3 rounded bg-ink/80 px-2 py-1 text-xs font-medium text-white">
              {active + 1} / {list.length}
            </span>
          </>
        )}
      </div>

      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-4 gap-3">
          {list.map((_, index) => (
            <li key={index}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === active}
                className={`block aspect-[10/7] w-full overflow-hidden rounded-md border-2 bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  index === active ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={srcFor(index)}
                  alt=""
                  loading="lazy"
                  onError={() => markFailed(index)}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default PropertyGallery;