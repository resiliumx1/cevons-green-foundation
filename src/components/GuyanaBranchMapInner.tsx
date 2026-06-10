import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface BranchPoint {
  id: string;
  name: string;
  label?: string;
  lat: number;
  lng: number;
  phone?: string;
  hours?: string;
}

interface Props {
  branches: BranchPoint[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  height?: string;
}

const greenIcon = (active: boolean) =>
  L.divIcon({
    className: "cevons-leaflet-pin",
    html: `<span style="position:relative;display:inline-block;">
      <span style="display:block;width:${active ? 30 : 24}px;height:${active ? 30 : 24}px;border-radius:9999px;background:${active ? "#FFD200" : "#006B35"};box-shadow:0 4px 10px rgba(0,0,0,0.25);border:3px solid #fff;"></span>
      <span style="position:absolute;left:50%;top:100%;transform:translate(-50%,-2px);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid ${active ? "#FFD200" : "#006B35"};"></span>
    </span>`,
    iconSize: [active ? 30 : 24, active ? 38 : 32],
    iconAnchor: [active ? 15 : 12, active ? 38 : 32],
    popupAnchor: [0, active ? -38 : -32],
  });

function FitBounds({ branches }: { branches: BranchPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!branches.length) return;
    const bounds = L.latLngBounds(branches.map((b) => [b.lat, b.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
  }, [map, branches]);
  return null;
}

function ScrollGate() {
  const map = useMap();
  useEffect(() => {
    map.scrollWheelZoom.disable();
    const enable = () => map.scrollWheelZoom.enable();
    const disable = () => map.scrollWheelZoom.disable();
    map.on("click", enable);
    map.on("focus", enable);
    map.on("mouseout", disable);
    return () => {
      map.off("click", enable);
      map.off("focus", enable);
      map.off("mouseout", disable);
    };
  }, [map]);
  return null;
}

function SelectionSync({ branches, selectedId }: { branches: BranchPoint[]; selectedId?: string }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedId) return;
    const b = branches.find((x) => x.id === selectedId);
    if (b) map.flyTo([b.lat, b.lng], Math.max(map.getZoom(), 9), { duration: 0.6 });
  }, [selectedId, branches, map]);
  return null;
}

export default function GuyanaBranchMapClient({ branches, selectedId, onSelect, height = "100%" }: Props) {
  const markerRefs = useRef<Record<string, L.Marker | null>>({});
  const center = useMemo<[number, number]>(() => [6.4, -58.0], []);

  useEffect(() => {
    if (selectedId) markerRefs.current[selectedId]?.openPopup();
  }, [selectedId]);

  return (
    <MapContainer
      center={center}
      zoom={7}
      minZoom={5}
      maxZoom={14}
      scrollWheelZoom={false}
      style={{ height, width: "100%", background: "#FBF7EE" }}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds branches={branches} />
      <ScrollGate />
      <SelectionSync branches={branches} selectedId={selectedId} />
      {branches.map((b) => {
        const active = b.id === selectedId;
        return (
          <Marker
            key={b.id}
            position={[b.lat, b.lng]}
            icon={greenIcon(active)}
            ref={(ref) => {
              markerRefs.current[b.id] = ref;
            }}
            eventHandlers={{
              click: () => onSelect?.(b.id),
            }}
          >
            <Popup>
              <div style={{ fontFamily: "inherit", minWidth: 160 }}>
                <div style={{ fontWeight: 700, color: "#006B35", fontSize: 14 }}>{b.name}</div>
                {b.label && (
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#B58900", fontWeight: 600 }}>
                    {b.label}
                  </div>
                )}
                {b.phone && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#334155" }}>
                    📞 <a href={`tel:${b.phone.replace(/\s+/g, "")}`} style={{ color: "#006B35" }}>{b.phone}</a>
                  </div>
                )}
                {b.hours && <div style={{ marginTop: 4, fontSize: 12, color: "#64748B" }}>🕒 {b.hours}</div>}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
