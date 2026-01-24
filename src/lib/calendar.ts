import type { EventContent } from './qr/types';

/**
 * Format a date for ICS file format (YYYYMMDDTHHMMSSZ for UTC)
 */
export function formatICSDate(date: Date, allDay?: boolean): string {
  if (allDay) {
    // For all-day events, use DATE format (YYYYMMDD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // For timed events, use UTC datetime format
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate an ICS (iCalendar) file content
 */
export function generateICS(event: EventContent): string {
  const now = new Date();
  const uid = `${now.getTime()}-${Math.random().toString(36).substring(2, 9)}@qrwolf.com`;

  // Parse dates
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  // For all-day events, add one day to end date (ICS convention: end date is exclusive)
  let adjustedEndDate = endDate;
  if (event.allDay) {
    adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
  }

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//QRWolf//Event QR//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now)}`,
  ];

  // Add start/end dates
  if (event.allDay) {
    lines.push(`DTSTART;VALUE=DATE:${formatICSDate(startDate, true)}`);
    lines.push(`DTEND;VALUE=DATE:${formatICSDate(adjustedEndDate, true)}`);
  } else {
    lines.push(`DTSTART:${formatICSDate(startDate)}`);
    lines.push(`DTEND:${formatICSDate(endDate)}`);
  }

  // Add summary (title) - escape special characters
  lines.push(`SUMMARY:${escapeICSText(event.title)}`);

  // Add description if present
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }

  // Add location if present
  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`);
  }

  // Add URL if present
  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Escape special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate a Google Calendar URL for the event
 */
export function generateGoogleCalendarUrl(event: EventContent): string {
  const baseUrl = 'https://calendar.google.com/calendar/render';
  const params = new URLSearchParams();

  params.set('action', 'TEMPLATE');
  params.set('text', event.title);

  // Format dates for Google Calendar
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  if (event.allDay) {
    // For all-day events, use date format (YYYYMMDD/YYYYMMDD)
    // End date needs to be exclusive (next day)
    const endDatePlusOne = new Date(endDate);
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);

    const startStr = formatGoogleDate(startDate, true);
    const endStr = formatGoogleDate(endDatePlusOne, true);
    params.set('dates', `${startStr}/${endStr}`);
  } else {
    // For timed events, use ISO format (YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ)
    const startStr = formatGoogleDate(startDate, false);
    const endStr = formatGoogleDate(endDate, false);
    params.set('dates', `${startStr}/${endStr}`);
  }

  if (event.description) {
    params.set('details', event.description);
  }

  if (event.location) {
    params.set('location', event.location);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Format date for Google Calendar URL
 */
function formatGoogleDate(date: Date, allDay: boolean): string {
  if (allDay) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  // Use UTC for timed events
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Generate an Outlook Web URL for the event
 */
export function generateOutlookUrl(event: EventContent): string {
  const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
  const params = new URLSearchParams();

  params.set('subject', event.title);
  params.set('path', '/calendar/action/compose');
  params.set('rru', 'addevent');

  // Format dates for Outlook (ISO 8601)
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  if (event.allDay) {
    params.set('allday', 'true');
    params.set('startdt', startDate.toISOString().split('T')[0]);
    params.set('enddt', endDate.toISOString().split('T')[0]);
  } else {
    params.set('startdt', startDate.toISOString());
    params.set('enddt', endDate.toISOString());
  }

  if (event.description) {
    params.set('body', event.description);
  }

  if (event.location) {
    params.set('location', event.location);
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Download an ICS file
 */
export function downloadICS(event: EventContent, filename?: string): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${event.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
