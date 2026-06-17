'use client';

import { useEffect, useState } from 'react';
import { formatLocationLabel } from '@mc-labor/shared';

const nominatimCache = new Map<string, string | null>();

async function reverseGeocodeNominatim(lat: number, lng: number): Promise<string | null> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (nominatimCache.has(key)) return nominatimCache.get(key) ?? null;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'en' } },
    );
    if (!res.ok) {
      nominatimCache.set(key, null);
      return null;
    }
    const data = (await res.json()) as {
      address?: {
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        county?: string;
        country?: string;
      };
    };
    const addr = data.address;
    const label = formatLocationLabel({
      city: addr?.city ?? addr?.town ?? addr?.village,
      region: addr?.state,
      subregion: addr?.county,
      country: addr?.country,
    });
    nominatimCache.set(key, label);
    return label;
  } catch {
    nominatimCache.set(key, null);
    return null;
  }
}

interface GpsLocationCellProps {
  lat?: string | number | null;
  lng?: string | number | null;
  label?: string | null;
}

export function GpsLocationCell({ lat, lng, label }: GpsLocationCellProps) {
  const [resolvedLabel, setResolvedLabel] = useState<string | null>(label ?? null);

  useEffect(() => {
    if (label) {
      setResolvedLabel(label);
      return;
    }
    if (lat == null || lng == null) return;

    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return;

    let cancelled = false;
    reverseGeocodeNominatim(latNum, lngNum).then((result) => {
      if (!cancelled && result) setResolvedLabel(result);
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, label]);

  if (lat == null || lng == null) {
    return <span className="text-gray-400">—</span>;
  }

  return (
    <div className="max-w-[200px] text-xs leading-tight text-gray-500">
      <span>{Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</span>
      {resolvedLabel ? (
        <span className="mt-0.5 block font-medium text-slate-700">{resolvedLabel}</span>
      ) : null}
    </div>
  );
}
