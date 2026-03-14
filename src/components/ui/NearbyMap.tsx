"use client";

import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapUser {
  user_id: string;
  name: string;
  age?: number;
  primary_photo: string | null;
  is_online?: boolean;
  last_active_at?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface SpreadUser extends MapUser {
  displayLat: number;
  displayLng: number;
}

interface NearbyMapProps {
  users: MapUser[];
  center?: { lat: number; lng: number };
  height?: number | string;
  onUserClick?: (userId: string) => void;
  className?: string;
}

function isOnline(lastActive?: string, online?: boolean): boolean {
  if (online) return true;
  if (!lastActive) return false;
  return Date.now() - new Date(lastActive).getTime() < 5 * 60 * 1000;
}

// Spread overlapping markers so they don't stack on the same spot
// Same logic as the mobile app's NearbyMapPreview
function spreadMarkers(users: MapUser[], center?: { lat: number; lng: number }): SpreadUser[] {
  const result: SpreadUser[] = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const hasCoords = user.latitude != null && user.longitude != null;
    let lat = hasCoords ? user.latitude! : undefined;
    let lng = hasCoords ? user.longitude! : undefined;

    // If user has no coordinates, scatter around center with wide spread
    if (lat === undefined || lng === undefined) {
      if (!center) continue;
      const hash = user.user_id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const angle = ((hash % 360) + i * 37) * (Math.PI / 180);
      const dist = 0.008 + (hash % 15) * 0.003;
      lat = center.lat + Math.cos(angle) * dist;
      lng = center.lng + Math.sin(angle) * dist;
    }

    // Check for overlapping markers (within ~100 meters)
    const overlapping = result.filter((existing) => {
      const latDiff = Math.abs(existing.displayLat - lat!);
      const lngDiff = Math.abs(existing.displayLng - lng!);
      return latDiff < 0.001 && lngDiff < 0.001;
    });

    if (overlapping.length > 0) {
      // Spread overlapping markers using deterministic hash + index
      const hash = user.user_id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const angle = ((hash % 360) + overlapping.length * 72 + i * 30) * (Math.PI / 180);
      const offsetDistance = 0.003 + (hash % 8) * 0.0005 + overlapping.length * 0.001;
      const latOffset = Math.cos(angle) * offsetDistance;
      const lngOffset = Math.sin(angle) * offsetDistance;

      result.push({
        ...user,
        displayLat: lat + latOffset,
        displayLng: lng + lngOffset,
      });
    } else {
      result.push({
        ...user,
        displayLat: lat,
        displayLng: lng,
      });
    }
  }

  return result;
}

function createUserMarker(user: MapUser): L.DivIcon {
  const online = isOnline(user.last_active_at, user.is_online);
  const photoHtml = user.primary_photo
    ? `<img src="${user.primary_photo}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;border-radius:50%;background:rgba(255,255,255,0.08);display:flex;align-items:center;justify-content:center;font-size:14px;color:rgba(255,255,255,0.4);">${user.name?.[0]?.toUpperCase() || "?"}</div>`;

  const onlineDot = online
    ? `<div style="position:absolute;bottom:-1px;right:-1px;width:12px;height:12px;border-radius:50%;background:#4CAF50;border:2px solid #0d1117;"></div>`
    : "";

  return L.divIcon({
    className: "nearby-map-marker",
    html: `
      <div style="position:relative;cursor:pointer;">
        <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,0.25);box-shadow:0 2px 8px rgba(0,0,0,0.5);">
          ${photoHtml}
        </div>
        ${onlineDot}
        <div style="position:absolute;top:44px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;color:rgba(255,255,255,0.6);text-shadow:0 1px 3px rgba(0,0,0,0.8);">${user.name}</div>
      </div>
    `,
    iconSize: [40, 56],
    iconAnchor: [20, 20],
  });
}

function createYouMarker(): L.DivIcon {
  return L.divIcon({
    className: "nearby-map-you-marker",
    html: `
      <div style="position:relative;">
        <div style="width:44px;height:44px;border-radius:50%;background:#E53935;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 8px rgba(229,57,53,0.2),0 4px 12px rgba(229,57,53,0.4);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
          </svg>
        </div>
        <div style="position:absolute;top:50px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;color:rgba(255,255,255,0.8);font-weight:600;text-shadow:0 1px 3px rgba(0,0,0,0.8);">You</div>
      </div>
    `,
    iconSize: [44, 62],
    iconAnchor: [22, 22],
  });
}

// Dark satellite-style map tile
const DARK_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const DARK_TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

export default function NearbyMap({
  users,
  center,
  height = 220,
  onUserClick,
  className = "",
}: NearbyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Compute center from user location or average of user positions
  const mapCenter = useMemo(() => {
    if (center) return center;
    const withCoords = users.filter((u) => u.latitude && u.longitude);
    if (withCoords.length > 0) {
      const avgLat = withCoords.reduce((s, u) => s + (u.latitude || 0), 0) / withCoords.length;
      const avgLng = withCoords.reduce((s, u) => s + (u.longitude || 0), 0) / withCoords.length;
      return { lat: avgLat, lng: avgLng };
    }
    // Default (Mumbai, India)
    return { lat: 19.076, lng: 72.8777 };
  }, [center, users]);

  // Spread markers so overlapping ones don't stack
  const spreadUsers = useMemo(() => spreadMarkers(users, mapCenter), [users, mapCenter]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer(DARK_TILE_URL, {
        attribution: DARK_TILE_ATTR,
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Add zoom control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(mapInstance.current);
    } else {
      mapInstance.current.setView([mapCenter.lat, mapCenter.lng], 13);
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add "You" marker at center
    const youMarker = L.marker([mapCenter.lat, mapCenter.lng], {
      icon: createYouMarker(),
      zIndexOffset: 1000,
    }).addTo(mapInstance.current);
    markersRef.current.push(youMarker);

    // Add spread user markers
    if (spreadUsers.length > 0) {
      spreadUsers.forEach((user) => {
        if (!mapInstance.current) return;
        const marker = L.marker([user.displayLat, user.displayLng], {
          icon: createUserMarker(user),
        }).addTo(mapInstance.current);

        if (onUserClick) {
          marker.on("click", () => onUserClick(user.user_id));
        }

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      const allPoints: [number, number][] = spreadUsers.map(
        (u) => [u.displayLat, u.displayLng] as [number, number]
      );
      allPoints.push([mapCenter.lat, mapCenter.lng]);
      const bounds = L.latLngBounds(allPoints);
      mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    // Force invalidateSize after a tick to fix white screen
    const timer = setTimeout(() => {
      mapInstance.current?.invalidateSize();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [spreadUsers, mapCenter, onUserClick]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className={`rounded-2xl overflow-hidden border border-white/[0.06] isolate ${className}`}
      style={{ height, width: "100%" }}
    />
  );
}
