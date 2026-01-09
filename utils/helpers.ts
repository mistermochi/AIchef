
export const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800; // Reduced from 880 for better storage efficiency
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.drawImage(img, 0, 0, width, height);
      // Use webp for better compression/quality ratio
      resolve(canvas.toDataURL('image/webp', 0.7));
    };
    img.onerror = (e) => {
      console.error("Image compression failed", e);
      reject(new Error("Failed to load image. If this is a HEIC file, please try converting to JPG first."));
    };
    img.src = base64Str;
  });
};

export const formatQty = (num: number) => Number(num.toFixed(2));
