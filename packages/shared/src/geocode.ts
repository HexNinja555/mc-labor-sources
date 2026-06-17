/** Normalize geocoder parts into a short display label, e.g. "Houston, TX" */
export function formatLocationLabel(parts: {
  city?: string | null;
  subregion?: string | null;
  region?: string | null;
  country?: string | null;
}): string | null {
  const city = parts.city?.trim();
  const region = parts.region?.trim();
  const subregion = parts.subregion?.trim();
  const country = parts.country?.trim();

  if (city && region) return `${city}, ${abbreviateRegion(region)}`;
  if (city && subregion) return `${city}, ${abbreviateRegion(subregion)}`;
  if (city) return city;
  if (region) return abbreviateRegion(region);
  if (subregion) return abbreviateRegion(subregion);
  if (country) return country;
  return null;
}

function abbreviateRegion(region: string): string {
  const usStates: Record<string, string> = {
    Alabama: 'AL',
    Alaska: 'AK',
    Arizona: 'AZ',
    Arkansas: 'AR',
    California: 'CA',
    Colorado: 'CO',
    Connecticut: 'CT',
    Delaware: 'DE',
    Florida: 'FL',
    Georgia: 'GA',
    Hawaii: 'HI',
    Idaho: 'ID',
    Illinois: 'IL',
    Indiana: 'IN',
    Iowa: 'IA',
    Kansas: 'KS',
    Kentucky: 'KY',
    Louisiana: 'LA',
    Maine: 'ME',
    Maryland: 'MD',
    Massachusetts: 'MA',
    Michigan: 'MI',
    Minnesota: 'MN',
    Mississippi: 'MS',
    Missouri: 'MO',
    Montana: 'MT',
    Nebraska: 'NE',
    Nevada: 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    Ohio: 'OH',
    Oklahoma: 'OK',
    Oregon: 'OR',
    Pennsylvania: 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    Tennessee: 'TN',
    Texas: 'TX',
    Utah: 'UT',
    Vermont: 'VT',
    Virginia: 'VA',
    Washington: 'WA',
    'West Virginia': 'WV',
    Wisconsin: 'WI',
    Wyoming: 'WY',
    'District of Columbia': 'DC',
  };
  return usStates[region] ?? region;
}

export function formatCoordsWithLabel(
  lat: number | string | null | undefined,
  lng: number | string | null | undefined,
  label?: string | null,
): string {
  if (lat == null || lng == null) return '—';
  const coords = `${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)}`;
  if (label) return `${coords} · ${label}`;
  return coords;
}
