
export const parseFuzzyNumber = (str: string): number => {
  if (!str) return 0;
  const cleanStr = str.trim();
  
  // Explicit float check to handle "4.5" correctly
  if (/^[\d\.]+$/.test(cleanStr)) {
      const val = parseFloat(cleanStr);
      return isNaN(val) ? 0 : val;
  }
  
  if (cleanStr === '半') return 0.5;
  
  const map: Record<string, number> = {
      '零': 0, '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, 
      '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '百': 100
  };
  
  let total = 0, current = 0;
  for (const char of cleanStr) {
      const val = map[char];
      if (val === undefined) continue;
      if (val === 10 || val === 100) {
          if (current === 0) current = 1;
          total += current * val;
          current = 0;
      } else {
          current = val;
      }
  }
  return total + current;
};

export const parseDurationToSeconds = (numRaw: string | number, unit: string) => {
  const num = typeof numRaw === 'string' ? parseFuzzyNumber(numRaw) : numRaw;
  if (isNaN(num)) return 0;

  const u = unit.toLowerCase();
  if (u.startsWith('min') || u.includes('分')) return num * 60;
  if (u.startsWith('hour') || u.startsWith('hr') || u.includes('小')) return num * 3600;
  if (u.startsWith('sec') || u.includes('秒')) return num;
  return 0;
};

export const findDurationInText = (text: string) => {
   // Prioritize full words to prevent 'minutes' matching as 'min' and leaving 'utes'
   const regex = /([0-9\.]+|[零一二兩三四五六七八九十百半]+)\s*(minutes?|mins?|hours?|hrs?|seconds?|secs?|分鐘|分|小時|秒鐘|秒)/i;
   const match = regex.exec(text);
   if (match) {
      return { seconds: parseDurationToSeconds(match[1], match[2]), label: match[0] };
   }
   return null;
};
