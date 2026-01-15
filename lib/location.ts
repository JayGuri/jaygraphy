export function formatDMS(latitude: number, longitude: number): string {
  const toDMS = (deg: number, isLat: boolean) => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = (minutesNotTruncated - minutes) * 60;

    const direction = isLat
      ? deg >= 0
        ? "N"
        : "S"
      : deg >= 0
      ? "E"
      : "W";

    return `${degrees}°${minutes}'${seconds.toFixed(1)}"${direction}`;
  };

  return `${toDMS(latitude, true)} ${toDMS(longitude, false)}`;
}

export function buildGoogleMapsUrlFromGps(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

export function buildGoogleMapsUrlFromLocation(location: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}


