import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Van, Passenger, GeoLocation } from '../types';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const getVanColor = (line: string) => {
  const colors: Record<string, string> = {
    'Rasa': '#dc2626', // red
    'Vila Verde': '#16a34a', // green
    'Cem Braças': '#ea580c', // orange
    'São José': '#9333ea', // purple
    'Baía Formosa': '#0d9488', // teal
    'Centro': '#2563eb', // blue
    'Manguinhos': '#db2777', // pink
    'José Gonçalves': '#4f46e5', // indigo
  };
  return colors[line] || '#2563eb';
};

const createVanIcon = (van: Van) => {
  const bgColor = getVanColor(van.line);
  return L.divIcon({
    className: 'custom-van-icon',
    html: `<div style="
      background-color: ${bgColor}; 
      color: white; 
      padding: 4px 12px; 
      border-radius: 9999px; 
      font-weight: bold; 
      white-space: nowrap; 
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      font-size: 14px;
      width: max-content;
      transform: translate(-50%, -50%);
    ">${van.line}</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -15],
  });
};

const passengerIcon = L.divIcon({
  className: 'custom-passenger-icon',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" stroke="#ffffff" stroke-width="1.5" style="width: 26px; height: 26px; filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.35));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = L.divIcon({
  className: 'custom-user-icon',
  html: `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="
        position: absolute;
        width: 32px;
        height: 32px;
        background-color: rgba(37, 99, 235, 0.45);
        border-radius: 50%;
        animation: user-pin-pulse 1.8s ease-out infinite;
      "></div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" stroke="#ffffff" stroke-width="1.5" style="width: 28px; height: 28px; position: relative; filter: drop-shadow(0px 3px 5px rgba(0,0,0,0.4));">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>
    <style>
      @keyframes user-pin-pulse {
        0% { transform: scale(0.4); opacity: 1; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

interface MapProps {
  vans: Van[];
  passengers?: Passenger[];
  userLocation?: GeoLocation | null;
  center?: GeoLocation;
  zoom?: number;
  recenterFlag?: number;
}

function ChangeView({ center, zoom, recenterFlag }: { center: GeoLocation; zoom: number; recenterFlag?: number }) {
  const map = useMap();
  const [hasCentered, setHasCentered] = React.useState(false);
  const [lastFlag, setLastFlag] = React.useState(recenterFlag);

  React.useEffect(() => {
    if (center && !hasCentered) {
      map.setView([center.lat, center.lng], zoom);
      setHasCentered(true);
    } else if (center && recenterFlag !== lastFlag) {
      map.setView([center.lat, center.lng], zoom);
      setLastFlag(recenterFlag);
    }
  }, [center, map, zoom, hasCentered, recenterFlag, lastFlag]);

  return null;
}

export default function Map({ vans, passengers = [], userLocation, center, zoom = 13, recenterFlag }: MapProps) {
  const defaultCenter = center || { lat: -22.7533, lng: -41.8906 }; // Búzios RJ roughly

  return (
    <MapContainer 
      center={[defaultCenter.lat, defaultCenter.lng]} 
      zoom={zoom} 
      className="w-full h-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {center && <ChangeView center={center} zoom={zoom} recenterFlag={recenterFlag} />}

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="font-semibold text-center">Você</div>
          </Popup>
        </Marker>
      )}

      {vans.map(van => (
        <Marker key={van.id} position={[van.location.lat, van.location.lng]} icon={createVanIcon(van)}>
          <Popup>
            <div className="p-1">
              <h3 className="font-bold text-lg border-b pb-1 mb-1">{van.driverName}</h3>
              <p className="text-sm"><span className="font-semibold">Linha:</span> {van.line}</p>
              <p className="text-sm"><span className="font-semibold">Status:</span> {van.status}</p>
              <p className="text-sm"><span className="font-semibold">Vagas:</span> {van.seatsAvailable}</p>
              <p className="text-sm"><span className="font-semibold">Passageiros:</span> {van.passengerCount}</p>
              <p className="text-sm"><span className="font-semibold">Velocidade:</span> {van.speed} km/h</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {passengers.map(p => (
        <Marker key={p.id} position={[p.location.lat, p.location.lng]} icon={passengerIcon}>
          <Popup>
            <div className="font-semibold text-center text-sm">
              Passageiro aguardando<br/>{p.line}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
