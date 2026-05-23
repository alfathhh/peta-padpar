import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';
import { Infrastruktur, KategoriInfra } from '../../types';
import { createCustomMarker } from '../../lib/gis/createCustomMarker';
import InfraPopup from './InfraPopup';

interface MarkerLayerProps {
  infrastruktur: Infrastruktur[];
  kategoriMap: Map<string, KategoriInfra>;
}

function createMarkerIcon(kat: KategoriInfra): L.DivIcon {
  return createCustomMarker({ categoryValue: kat.value, kategori: kat });
}

export default function MarkerLayer({ infrastruktur, kategoriMap }: MarkerLayerProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
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
        maxWidth: 300,
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
