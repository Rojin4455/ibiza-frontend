import { Bath, Bed, CheckCircle, MapPin, User, Sparkles } from 'lucide-react';
import React, { useState } from 'react';

function idInList(propertyId, list) {
  if (propertyId == null || !list?.length) return false;
  const s = String(propertyId);
  return list.some((x) => String(x) === s);
}

function UserPropertyCard({
  property,
  togglePropertySelection,
  isLastElement,
  lastPropertyElementRef,
  selectedProperties,
  noSelect,
  isSelection,
  allSharedPropertyIds,
  lastSharedPropertyIds,
}) {
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const images = Array.isArray(property.images) ? property.images : [];

  React.useEffect(() => {
    let interval;
    if (hovered && images.length > 1) {
      interval = setInterval(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, 1000);
    } else {
      setImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [hovered, images.length]);

  const everShared = idInList(property.id, allSharedPropertyIds);
  const inLatestSend = idInList(property.id, lastSharedPropertyIds);
  const hasBatchInfo = lastSharedPropertyIds && lastSharedPropertyIds.length > 0;
  const earlierOnly = everShared && !inLatestSend && hasBatchInfo;
  const showLatestSendBadge = !isSelection && inLatestSend && hasBatchInfo;
  const selectionLocked = !isSelection && everShared;

  return (
    <div
      key={property.id}
      ref={isLastElement ? lastPropertyElementRef : null}
      className={`relative bg-slate-50 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-2xl hover:-translate-y-1 border ${
        everShared ? 'border-green-500' : 'border-slate-200'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        {images.length > 0 ? (
          <img
            src={images[imageIndex] || images[0]}
            alt={property.reference}
            className="w-full h-52 object-cover transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-52 flex items-center justify-center bg-gray-200">
            <span className="text-gray-400">No image available</span>
          </div>
        )}

        {!noSelect && (
          <div
            className={`absolute top-3 left-3 z-10 ${selectionLocked ? 'cursor-not-allowed opacity-60' : ''}`}
            title={
              selectionLocked
                ? 'Already sent to this contact — select other listings for your next email'
                : undefined
            }
          >
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                disabled={selectionLocked}
                className="form-checkbox h-5 w-5 text-secondary rounded border-2 border-white shadow disabled:cursor-not-allowed"
                checked={!selectionLocked && idInList(property.id, selectedProperties)}
                onChange={() => togglePropertySelection(property.id)}
              />
            </label>
          </div>
        )}

        <div className="absolute top-3 left-10 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-10">
          {property.property_type}
        </div>

        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 items-end max-w-[55%]">
          {isSelection && hasBatchInfo && inLatestSend && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <Sparkles size={14} className="shrink-0" aria-hidden />
              Latest email
            </div>
          )}
          {isSelection && earlierOnly && (
            <div className="flex items-center gap-1 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              Earlier share
            </div>
          )}
          {isSelection && everShared && !hasBatchInfo && (
            <div className="flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <CheckCircle size={14} className="shrink-0" aria-hidden />
              Shared with you
            </div>
          )}
          {!isSelection && everShared && (
            <div className="flex items-center gap-1 rounded-full bg-green-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <CheckCircle size={14} className="shrink-0" aria-hidden />
              Already sent
            </div>
          )}
          {showLatestSendBadge && (
            <div className="flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <Sparkles size={14} className="shrink-0" aria-hidden />
              Latest send
            </div>
          )}
          <div className="rounded-full bg-secondary text-white text-xs font-semibold px-3 py-1 shadow-sm">
            {property.currency}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="text-xl font-semibold text-primaryhover">
            €{parseFloat(property.price).toLocaleString()}
          </p>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {property.reference}
          </h3>
        </div>

        <p className="text-slate-500 text-sm mb-3 flex items-center">
          <MapPin size={16} className="mr-1 text-slate-400 shrink-0" />
          {property.town}, {property.province}
        </p>
        {!isSelection && (
          <p className="text-slate-500 text-sm mb-3 flex items-center">
            <User size={16} className="mr-1 text-slate-400 shrink-0" />
            {property.contact_name}
          </p>
        )}

        <div className="flex justify-between text-sm text-slate-600 mb-4">
          <span className="flex items-center gap-1">
            <Bed size={16} className="text-primary" />
            {property.beds} {property.beds === 1 ? 'Bed' : 'Beds'}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={16} className="text-primary" />
            {property.baths} {property.baths === 1 ? 'Bath' : 'Baths'}
          </span>
          <span className="text-sm font-medium">
            {property.built_area != null ? Number(property.built_area).toLocaleString() : '—'} m²
          </span>
        </div>

        <div className="pt-3 border-t border-slate-200">
          <a
            href={property.url}
            target="_blank"
            rel="noreferrer"
            className="w-full block text-center bg-primary text-white rounded-lg py-2 text-sm font-semibold hover:bg-primaryhover transition-colors shadow-md"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
}

export default UserPropertyCard;
