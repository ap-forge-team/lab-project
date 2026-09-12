import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
})

function FixMapSize() {
  const map = useMap()
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 300)
    return () => clearTimeout(timer)
  }, [map])
  return null
}

function RecenterMap({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], 17)
    }
  }, [location, map])
  return null
}

function DraggableMarker({ location, setLocation, onLocationSelect }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat
      const lng = e.latlng.lng
      setLocation({ lat, lng })
      onLocationSelect(lat, lng)
    },
  })
  if (!location) return null
  return (
    <Marker
      draggable
      icon={markerIcon}
      position={[location.lat, location.lng]}
      eventHandlers={{
        dragend: (e) => {
          const pos = e.target.getLatLng()
          setLocation({ lat: pos.lat, lng: pos.lng })
          onLocationSelect(pos.lat, pos.lng)
        },
      }}
    />
  )
}

export default function LocationPicker({ location, setLocation, onLocationSelect }) {
  return (
    <MapContainer
      center={location ? [location.lat, location.lng] : [18.5204, 73.8567]}
      zoom={17}
      style={{ height: '500px', width: '100%', borderRadius: '12px' }}
    >
      <FixMapSize />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap location={location} />
      <DraggableMarker
        location={location}
        setLocation={setLocation}
        onLocationSelect={onLocationSelect}
      />
    </MapContainer>
  )
}
