import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CanonicalIncident, GeoLocation } from '../types';

interface IncidentMapProps {
  incidents: CanonicalIncident[];
  selectedIncidentId?: string;
  onSelectIncident?: (incident: CanonicalIncident) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
  interactiveSelection?: boolean;
  onLocationPick?: (loc: GeoLocation) => void;
}

export const IncidentMap: React.FC<IncidentMapProps> = ({
  incidents,
  selectedIncidentId,
  onSelectIncident,
  center = [12.9716, 77.5946], // Greenfield Ward demo center
  zoom = 15,
  height = '400px',
  interactiveSelection = false,
  onLocationPick
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        attributionControl: false
      });

      // Add CartoDB Positron clean map tiles (reliable, fast, no API key required)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
      }).addTo(map);

      if (interactiveSelection && onLocationPick) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          if (pickMarkerRef.current) {
            pickMarkerRef.current.setLatLng([lat, lng]);
          } else {
            const pinIcon = L.divIcon({
              className: 'custom-pin-icon',
              html: `<div style="background-color: #0284c7; width: 22px; height: 22px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });
            pickMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          }
          onLocationPick({
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            address: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} (Greenfield Ward)`
          });
        });
      }

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when incidents change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing incident markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    incidents.forEach(inc => {
      const isSelected = inc.id === selectedIncidentId;
      const isRecurring = inc.recurrenceCount > 1 || inc.status === 'recurring';

      let color = '#0284c7'; // default blue
      if (inc.category === 'waterlogging') color = '#0ea5e9'; // sky
      if (inc.category === 'potholes') color = '#f97316'; // orange
      if (inc.category === 'waste_accumulation') color = '#8b5cf6'; // purple
      if (isRecurring) color = '#e11d48'; // red hotspot

      const iconHtml = `
        <div style="
          background-color: ${color};
          width: ${isSelected ? '28px' : '22px'};
          height: ${isSelected ? '28px' : '22px'};
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 11px;
          font-weight: bold;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          ${isRecurring ? inc.recurrenceCount : '•'}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'incident-marker-icon',
        html: iconHtml,
        iconSize: isSelected ? [28, 28] : [22, 22],
        iconAnchor: isSelected ? [14, 14] : [11, 11]
      });

      const marker = L.marker([inc.canonicalLocation.lat, inc.canonicalLocation.lng], {
        icon: customIcon
      }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; font-size: 12px; min-width: 180px;">
          <div style="font-weight: bold; color: #0f172a; margin-bottom: 4px;">${inc.title}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${inc.canonicalLocation.address || 'Greenfield Ward'}</div>
          <div style="display: flex; gap: 6px; font-size: 10px;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase;">${inc.category}</span>
            <span style="background: ${isRecurring ? '#ffe4e6' : '#ecfdf5'}; color: ${isRecurring ? '#e11d48' : '#059669'}; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
              ${isRecurring ? `Recurring (${inc.recurrenceCount}x)` : inc.status}
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectIncident) {
          onSelectIncident(inc);
        }
      });

      markersRef.current.push(marker);
    });

    // If selected incident exists, pan to it
    if (selectedIncidentId) {
      const match = incidents.find(i => i.id === selectedIncidentId);
      if (match) {
        map.setView([match.canonicalLocation.lat, match.canonicalLocation.lng], 16, { animate: true });
      }
    }
  }, [incidents, selectedIncidentId, onSelectIncident]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 px-3 py-2 text-[11px] font-medium text-slate-700 shadow-md backdrop-blur-sm border border-slate-200/80 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-600"></span>
          <span>Recurring Hotspot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span>
          <span>Waterlogging</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
          <span>Potholes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
          <span>Waste</span>
        </div>
      </div>
    </div>
  );
};
