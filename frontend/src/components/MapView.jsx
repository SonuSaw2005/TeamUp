import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet Marker Icon issue in React/Vite using CDN links
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Custom component to dynamically center/pan the map view
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13, { animate: true });
    }
  }, [center, map]);
  return null;
};

const MapView = ({ grounds = [], selectedGround = null, onSelectGround = null, height = "400px" }) => {
  const defaultCenter = [17.6890, 73.9883]; // Satara, Maharashtra default
  const mapCenter = selectedGround 
    ? [selectedGround.latitude, selectedGround.longitude] 
    : defaultCenter;

  return (
    <div style={{ height }} className="w-full relative shadow-md rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {grounds.map((ground) => (
          <Marker 
            key={ground.id} 
            position={[ground.latitude, ground.longitude]} 
            icon={defaultIcon}
          >
            <Popup>
              <div className="p-1 dark:text-slate-800">
                <h3 className="font-bold text-sm">{ground.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{ground.address}</p>
                <div className="mt-2 text-xs font-semibold text-primary-600">
                  Sports: {ground.sportsAvailable}
                </div>
                {onSelectGround && (
                  <button
                    onClick={() => onSelectGround(ground)}
                    className="mt-3 w-full bg-primary-600 text-white text-xs font-medium py-1 px-2 rounded hover:bg-primary-700 transition"
                  >
                    Select Ground
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <MapRecenter center={mapCenter} />
      </MapContainer>
    </div>
  );
};

export default MapView;
