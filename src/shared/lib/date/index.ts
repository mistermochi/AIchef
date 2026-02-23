
import { Timestamp } from 'firebase/firestore';

/**
 * Normalizes various date formats (Firestore Timestamp, Date, string) into a Javascript Date.
 * @param {Timestamp|Date|string|null|undefined} d - The date-like object.
 * @returns {Date} Normalized Date object.
 */
export const toDate = (d: Timestamp | Date | string | null | undefined): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (d && typeof (d as any).toDate === 'function') return (d as any).toDate();
  const _d = new Date(d as string | number | Date);
  return isNaN(_d.getTime()) ? new Date() : _d;
};

/**
 * Formats a Firestore Timestamp or Date object into a short date string (e.g., "Jan 1").
 * @param {Timestamp|Date|string|null|undefined} d - The date or timestamp to format.
 * @returns {string} Short date string.
 */
export const fmtDate = (d: Timestamp | Date | string | null | undefined) => {
  const _d = toDate(d);
  return _d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Formats a date for use in an HTML date input (YYYY-MM-DD).
 * @param {Timestamp|Date|string|null|undefined} d - The date or timestamp to format.
 * @returns {string} Date string in YYYY-MM-DD format.
 */
export const fmtDateInput = (d: Timestamp | Date | string | null | undefined) => {
  const _d = toDate(d);
  if (isNaN(_d.getTime())) return new Date().toISOString().split('T')[0];
  const year = _d.getFullYear();
  const month = String(_d.getMonth() + 1).padStart(2, '0');
  const day = String(_d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
