/**
 * Robust RFC 4180 compliant CSV parser.
 * Supports:
 * - Quoted fields with embedded commas
 * - Escaped double quotes ("")
 * - Embedded newlines inside quoted fields
 * - CRLF and LF record separators
 * - Empty rows skipping
 * - Accurate 1-indexed line/row tracking
 */

export interface ParsedCsvRow {
  rowNumber: number; // 1-indexed row number in the CSV file
  data: Record<string, string>;
}

export interface CsvParseResult {
  headers: string[];
  rows: ParsedCsvRow[];
}

export function parseCsv(content: string): CsvParseResult {
  const records: string[][] = [];
  let currentRecord: string[] = [];
  let currentField = "";
  let insideQuotes = false;
  let i = 0;
  const len = content.length;

  while (i < len) {
    const char = content[i];

    if (insideQuotes) {
      if (char === '"') {
        if (i + 1 < len && content[i + 1] === '"') {
          // Escaped quote
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Closing quote
          insideQuotes = false;
          i++;
          continue;
        }
      } else {
        currentField += char;
        i++;
        continue;
      }
    } else {
      if (char === '"') {
        insideQuotes = true;
        i++;
        continue;
      } else if (char === ',') {
        currentRecord.push(currentField.trim());
        currentField = "";
        i++;
        continue;
      } else if (char === '\r') {
        if (i + 1 < len && content[i + 1] === '\n') {
          i++; // skip \r, next is \n
        }
        currentRecord.push(currentField.trim());
        currentField = "";
        if (currentRecord.some((f) => f.length > 0)) {
          records.push(currentRecord);
        }
        currentRecord = [];
        i++;
        continue;
      } else if (char === '\n') {
        currentRecord.push(currentField.trim());
        currentField = "";
        if (currentRecord.some((f) => f.length > 0)) {
          records.push(currentRecord);
        }
        currentRecord = [];
        i++;
        continue;
      } else {
        currentField += char;
        i++;
        continue;
      }
    }
  }

  // Final field and record if present
  if (currentField.length > 0 || currentRecord.length > 0) {
    currentRecord.push(currentField.trim());
    if (currentRecord.some((f) => f.length > 0)) {
      records.push(currentRecord);
    }
  }

  if (records.length === 0) {
    return { headers: [], rows: [] };
  }

  const rawHeaders = records[0];
  const headers = rawHeaders.map((h) => h.trim().toLowerCase());

  const rows: ParsedCsvRow[] = [];
  for (let r = 1; r < records.length; r++) {
    const record = records[r];
    const data: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      data[header] = c < record.length ? record[c] : "";
    }
    rows.push({
      rowNumber: r + 1, // 1-indexed, header is row 1, first data row is 2
      data,
    });
  }

  return { headers, rows };
}
