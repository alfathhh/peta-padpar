import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { Infrastruktur, KategoriInfra } from '../../types';
import { createCustomMarker } from '../../lib/gis/createCustomMarker';
import CustomMapPopout from './CustomMapPopout';

interface MarkerLayerProps {
  infrastruktur: Infrastruktur[];
  kategoriMap: Map<string, KategoriInfra>;
}

// Layer marker infrastruktur
export default function MarkerLayer({ infrastruktur, kategoriMap }: MarkerLayerProps) {
  return (
    <>
      {infrastruktur.map((infra) => {
        const kat = kategoriMap.get(infra.kategori);

  useEffect(() => {
    // Bersihkan layer lama
    if (layerGroupRef.current) {
      layerGroupRef.current.clearLayers();
      map.removeLayer(layerGroupRef.current);
    }

    if (infrastruktur.length === 0) return;

    const layerGroup = L.layerGroup();
    layerGroupRef.current = layerGroup;

    for (const infra of infrastruktur) {
      const kat = kategoriMap.get(infra.kategori);

      const marker = L.marker([infra.lat, infra.lng], {
        icon: kat ? createMarkerIcon(kat) : undefined,
      });

      const popupContent = ReactDOMServer.renderToStaticMarkup(
        <InfraPopup infra={infra} kategori={kat} />,
      );

      marker.bindPopup(popupContent, {
        maxWidth: 320,
        className: 'infra-popup',
      });

      layerGroup.addLayer(marker);
    }

    layerGroup.addTo(map);

    return () => {
      layerGroup.clearLayers();
      map.removeLayer(layerGroup);
    };
  }, [infrastruktur, kategoriMap, map]);

  return null;
}
