import { useState } from "react";
import { Link } from "react-router-dom";
import {
  formatPrice,
  getPropertyImage,
  plural,
} from "../utils/format";

function PropertyCard({ property }) {
  const { id, title, area, city, type, status, price, beds, baths, sqm } =
    property;

  const [imgFailed, setImgFailed] = useState(false);

  const isLand = type === "Land";
  const isStudio = !isLand && beds === 0;
  const isSale = status === "sale";

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition-colors hover:border-steel motion-reduce:transition-none">
      <div className="relative aspect-[10/7] bg-mist">
        <img
          src={imgFailed ? getPropertyImage(property, 0, true) : getPropertyImage(property)}
          alt={title}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
        <span
          className={`absolute left-3 top-3 rounded px-2.5 py-1 text-xs font-semibold text-white ${
            isSale ? "bg-sale" : "bg-rent"
          }`}
        >
          {isSale ? "For sale" : "For rent"}
        </span>
      </div>

      <div className="p-4 pb-5">
        <p className="mb-1 text-xl font-bold text-ink">
          {formatPrice(price)}
          {!isSale && (
            <span className="ml-1 text-sm font-medium text-steel">/ year</span>
          )}
        </p>

        <h3 className="mb-0.5 font-semibold text-ink">
          {/* The after: classes stretch this link over the whole card */}
          <Link
            to={`/properties/${id}`}
            className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            {title}
          </Link>
        </h3>

        <p className="mb-4 text-sm text-steel">
          {area}, {city}
        </p>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3 text-sm text-ink">
          {isStudio && <li>Studio</li>}
          {!isLand && !isStudio && typeof beds === "number" && (
            <li>{plural(beds, "bed")}</li>
          )}
          {!isLand && typeof baths === "number" && baths > 0 && (
            <li>{plural(baths, "bath")}</li>
          )}
          {sqm ? <li>{sqm} m²</li> : null}
          <li>{type}</li>
        </ul>
      </div>
    </article>
  );
}

export default PropertyCard;