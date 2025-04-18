// Utility functions for exporting data to CSV format

/**
 * Convert an array of objects to CSV format
 * @param data Array of objects to convert
 * @param headers Optional custom headers (keys from the objects)
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (!data || data.length === 0) {
    return '';
  }

  // If headers are not provided, use the keys from the first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create the header row
  const headerRow = csvHeaders.join(',');

  // Create the data rows
  const rows = data.map(item => {
    return csvHeaders.map(header => {
      // Get the value for this header
      const value = item[header];
      
      // Handle different types of values
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes if the value contains commas or quotes
        const escaped = value.replace(/"/g, '""');
        return escaped.includes(',') || escaped.includes('"') || escaped.includes('\n')
          ? `"${escaped}"`
          : escaped;
      } else if (value instanceof Date) {
        return value.toISOString();
      } else {
        return String(value);
      }
    }).join(',');
  }).join('\n');

  // Combine header and rows
  return `${headerRow}\n${rows}`;
}

/**
 * Download data as a CSV file
 * @param data Array of objects to export
 * @param filename Filename for the downloaded file
 * @param headers Optional custom headers (keys from the objects)
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: string[]
): void {
  // Convert data to CSV
  const csv = convertToCSV(data, headers);
  
  // Create a Blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Add the link to the document
  document.body.appendChild(link);
  
  // Click the link to trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format a date for use in filenames
 * @param date Date to format
 * @returns Formatted date string (YYYY-MM-DD)
 */
export function formatDateForFilename(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}
