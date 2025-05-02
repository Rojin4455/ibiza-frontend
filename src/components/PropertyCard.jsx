import React, { useState } from 'react';
import { MapPin, Bed, Bath,User } from 'lucide-react';

const PropertyCard = ({ property }) => {
  const [hovered, setHovered] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  // Auto-slide images every 1s when hovered
  React.useEffect(() => {
    let interval;
    if (hovered && property.images.length > 1) {
      interval = setInterval(() => {
        setImageIndex((prevIndex) => (prevIndex + 1) % property.images.length);
      }, 1000);
    } else {
      setImageIndex(0); // reset to first image 
    }
    return () => clearInterval(interval);
  }, [hovered, property.images.length]);

  return (
    <div
  className="bg-slate-50 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-2xl hover:-translate-y-1 border border-slate-200"
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  <div className="relative">
    <img
      src={property.images[imageIndex]}
      alt={property.reference}
      className="w-full h-52 object-cover transition-opacity duration-500"
    />
    <div className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
      {property.property_type}
    </div>
    <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
      {property.currency}
    </div>
  </div>
  <div className="p-5">
    <div className="flex justify-between items-center mb-2">
      <p className="text-xl font-semibold text-primaryhover">
        {property.price? "€"+parseFloat(property.price).toLocaleString(): "Price Not Provided"}  
      </p>
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
        {property.reference}
      </h3>
    </div>
    <p className="text-slate-500 text-sm mb-3 flex items-center">
      <MapPin size={16} className="mr-1 text-slate-400" />
      {property.town}, {property.province}
    </p>
    <p className="text-slate-500 text-sm mb-3 flex items-center">
      <User size={16} className="mr-1 text-slate-400" />
      {property.contact_name}
    </p>
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
        {property.built_area.toLocaleString()} m²
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
};

export default PropertyCard;
