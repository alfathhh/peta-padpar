import React from 'react';
import { useMapStore } from '../../store/mapStore';

export default function BasemapToggle() {
  const { basemap, toggleBasemap } = useMapStore();

  const getLabel = () => {
    switch (basemap) {
      case 'osm': return 'Satelit';
      case 'google-satellite': return 'Jalan';
      case 'google-road': return 'Peta';
      default: return 'Peta';
    }
  };

  return (
    <button
      type="button"
      onClick={toggleBasemap}
      aria-label={`Ganti ke ${getLabel()}`}
      title={`Ganti ke ${getLabel()}`}
      className="absolute bottom-5 right-4 z-[900] rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-pop transition-colors duration-250 hover:bg-neutral-50 focus:outline-none focus-visible:shadow-focus"
    >
      {getLabel()}
    </button>
  );
}
