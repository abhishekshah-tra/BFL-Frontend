import { memo, useEffect, useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import { MilestoneStatus } from '../../types/itemTrace'
import { STATUS_LABELS } from '../../constants/status'
import { Card } from '../common/StatusBadge'
import 'leaflet/dist/leaflet.css'

const ROUTE_ORDER = ['supplier', 'yoto', 'jafza', 'techno', 'store']

function createIcon(status, selected) {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<div class="map-pin map-pin--${status}${selected ? ' is-selected' : ''}"><span></span></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  })
}

function MapControls({ center, zoom }) {
  const map = useMap()
  return (
    <div className="map-controls">
      <button type="button" aria-label="Zoom in" onClick={() => map.zoomIn()}>
        <Plus size={14} />
      </button>
      <button type="button" aria-label="Zoom out" onClick={() => map.zoomOut()}>
        <Minus size={14} />
      </button>
      <button
        type="button"
        aria-label="Recenter map"
        onClick={() => map.setView(center, zoom)}
      >
        <LocateFixed size={14} />
      </button>
    </div>
  )
}

function FitOnSelect({ location }) {
  const map = useMap()
  useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], Math.max(map.getZoom(), 10), { duration: 0.6 })
    }
  }, [location, map])
  return null
}

export const JourneyMap = memo(function JourneyMap({
  locations,
  selectedLocationId,
  onSelectLocation,
}) {
  const ordered = useMemo(
    () => ROUTE_ORDER.map((id) => locations.find((item) => item.id === id)).filter(Boolean),
    [locations],
  )

  const center = [25.05, 55.25]
  const zoom = 8

  const completedLine = ordered
    .filter((item) => item.status === MilestoneStatus.Completed || item.status === MilestoneStatus.InProgress)
    .map((item) => [item.lat, item.lng])

  const upcomingLine = ordered
    .filter((item) => item.status !== MilestoneStatus.Completed)
    .map((item) => [item.lat, item.lng])

  const selected = locations.find((item) => item.id === selectedLocationId)

  return (
    <Card className="map-card" title="Journey Map (Network View)">
      <div className="map-canvas">
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          attributionControl={false}
          className="leaflet-host"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap &copy; CARTO"
          />
          {completedLine.length > 1 ? (
            <Polyline positions={completedLine} pathOptions={{ color: '#1f7a4d', weight: 3 }} />
          ) : null}
          {upcomingLine.length > 1 ? (
            <Polyline
              positions={upcomingLine}
              pathOptions={{ color: '#8b95a1', weight: 3, dashArray: '6 8' }}
            />
          ) : null}
          {ordered.map((location) => (
            <Marker
              key={location.id}
              position={[location.lat, location.lng]}
              icon={createIcon(location.status, location.id === selectedLocationId)}
              eventHandlers={{
                click: () => onSelectLocation(location.id),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                {location.name}
              </Tooltip>
              <Popup>
                <strong>{location.name}</strong>
                <p>{location.address}</p>
                <p>Status: {STATUS_LABELS[location.status]}</p>
              </Popup>
            </Marker>
          ))}
          <MapControls center={center} zoom={zoom} />
          <FitOnSelect location={selected} />
        </MapContainer>
        <ul className="map-legend" aria-label="Map legend">
          <li><span className="status-dot status-dot--completed" /> Completed</li>
          <li><span className="status-dot status-dot--in_progress" /> In Progress</li>
          <li><span className="status-dot status-dot--upcoming" /> Upcoming</li>
        </ul>
      </div>
    </Card>
  )
})
