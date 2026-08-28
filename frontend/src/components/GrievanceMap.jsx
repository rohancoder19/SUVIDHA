import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function GrievanceMap({ grievances = [], onSelectGrievance, selectedGrievanceId }) {
  const mapRef = useRef(null);
  const leafletMapInstance = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    // Dynamically inject Leaflet CSS if not already loaded
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS dynamically
    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    }

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (leafletMapInstance.current && window.L) {
      updateMarkers();
    }
  }, [grievances, selectedGrievanceId]);

  const initMap = () => {
    if (!mapRef.current || leafletMapInstance.current) return;

    // Default center (Pune/Central India area)
    const map = window.L.map(mapRef.current, {
      center: [18.5204, 73.8567],
      zoom: 12,
      zoomControl: true
    });

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    leafletMapInstance.current = map;
    updateMarkers();
  };

  const updateMarkers = () => {
    const map = leafletMapInstance.current;
    if (!map || !window.L) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    const bounds = window.L.latLngBounds();
    let hasCoords = false;

    grievances.forEach((g, idx) => {
      // Fallback synthetic coordinates spread around center if missing
      const lat = g.latitude || (18.5204 + (idx % 3 === 0 ? 0.015 : idx % 2 === 0 ? -0.012 : 0.008) * ((idx + 1) * 0.7));
      const lng = g.longitude || (73.8567 + (idx % 2 === 0 ? 0.018 : -0.014) * ((idx + 1) * 0.6));

      bounds.extend([lat, lng]);
      hasCoords = true;

      // Color coding based on priority
      let pinColor = '#3b82f6'; // Blue
      if (g.priority === 'CRITICAL') pinColor = '#ef4444'; // Red
      else if (g.priority === 'HIGH') pinColor = '#f59e0b'; // Amber/Orange
      else if (g.priority === 'MEDIUM') pinColor = '#eab308'; // Yellow
      else if (g.priority === 'LOW') pinColor = '#10b981'; // Green

      const customIcon = window.L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${pinColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #0e1726;
            box-shadow: 0 0 12px ${pinColor}88;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: 800;
            cursor: pointer;
            transition: transform 0.2s;
          " class="marker-hover-effect">
            ${idx + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = window.L.marker([lat, lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; color: #0f172a;">
          <div style="font-size: 10px; font-weight: 800; color: ${pinColor}; text-transform: uppercase; margin-bottom: 2px;">
            ${g.priority || 'MEDIUM'} PRIORITY • Urgency: ${g.urgencyScore || 50}/100
          </div>
          <div style="font-size: 12px; font-weight: 700; margin-bottom: 4px; color: #020617;">
            ${g.subject || g.title}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 6px;">
            Category: <strong>${g.category}</strong><br/>
            Dept: <strong>${g.department || 'Unassigned'}</strong>
          </div>
          <button id="marker-btn-${g._id || idx}" style="
            width: 100%;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 4px 8px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">
            Inspect AI Triage
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        setTimeout(() => {
          const btn = document.getElementById(`marker-btn-${g._id || idx}`);
          if (btn) {
            btn.onclick = () => {
              if (onSelectGrievance) onSelectGrievance(g);
            };
          }
        }, 100);
      });

      markersRef.current[g._id || idx] = marker;
    });

    if (hasCoords && grievances.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  };

  const handleLiveGPS = () => {
    if (navigator.geolocation && leafletMapInstance.current) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          leafletMapInstance.current.setView([latitude, longitude], 14);
          if (window.L) {
            window.L.popup()
              .setLatLng([latitude, longitude])
              .setContent('📍 <strong>You are here</strong> (Nodal Officer Location)')
              .openOn(leafletMapInstance.current);
          }
        },
        () => {
          alert('GPS location permission denied. Centered on District HQ.');
        }
      );
    }
  };

  return (
    <div className="bg-[#0e1726]/90 border border-[#1e293b] rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100 font-outfit">
            Spatial Distribution of Grievance Pins
          </h2>
        </div>

        <button
          onClick={handleLiveGPS}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-bold flex items-center space-x-1.5 shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>My Live GPS</span>
        </button>
      </div>

      <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-[#1e293b] shadow-inner">
        <div ref={mapRef} className="w-full h-full z-10" />
      </div>
    </div>
  );
}
