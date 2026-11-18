export type SizeCode = 'S' | 'M' | 'L' | 'XL';

export interface SizeMeasurement {
  size: SizeCode;
  /** X — Ancho de prenda (cm) */
  ancho: string;
  /** Y — Largo total (cm) */
  largo: string;
  /** T — Ancho de manga (cm) */
  anchoManga: string;
  /** Θ — Largo de manga (cm) */
  largoManga: string;
}

export const OFFICIAL_SIZE_CHART: SizeMeasurement[] = [
  { size: 'S', ancho: '51 cm', largo: '68.5 cm', anchoManga: '17 cm', largoManga: '20 cm' },
  { size: 'M', ancho: '52 cm', largo: '69 cm', anchoManga: '17.5 cm', largoManga: '20 cm' },
  { size: 'L', ancho: '54 cm', largo: '70 cm', anchoManga: '18 cm', largoManga: '21 cm' },
  { size: 'XL', ancho: '55 cm', largo: '72 cm', anchoManga: '19 cm', largoManga: '22.5 cm' },
];

export const SIZE_CHART_FOOTNOTE =
  '*Las medidas pueden variar ligeramente. Medidas tomadas en plano.';

export function getSizeMeasurements(size: string): SizeMeasurement | undefined {
  const normalized = size.trim().toUpperCase();
  return OFFICIAL_SIZE_CHART.find((row) => row.size === normalized);
}
