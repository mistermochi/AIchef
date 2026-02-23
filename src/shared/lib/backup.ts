
export const downloadFile = (content: string, filename: string, type: 'json' | 'csv') => {
  const mime = type === 'json' ? 'application/json' : 'text/csv';
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

export const jsonToCSV = (items: any[], columns: string[]) => {
  const header = columns.join(',');
  const rows = items.map(item =>
    columns.map(col => {
      const val = item[col] ?? '';
      // Escape quotes and wrap in quotes if necessary
      const str = String(val).replace(/"/g, '""');
      return /[,\n"]/.test(str) ? `"${str}"` : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
};

export const csvToJson = (csv: string): any[] => {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  
  const parseLine = (line: string) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  return lines.slice(1).map(line => {
    if (!line.trim()) return null;
    const values = parseLine(line);
    const obj: any = {};
    headers.forEach((h, i) => {
      let val = values[i] || '';
      obj[h] = val;
    });
    return obj;
  }).filter(Boolean);
};
