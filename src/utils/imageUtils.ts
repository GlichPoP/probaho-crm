/**
 * Utility for processing and automatically resizing company brand logos
 * for standard A4 invoice printing.
 *
 * Supported formats: SVG, PNG, JPG, JPEG, WEBP
 */

export interface ProcessedLogoResult {
  dataUrl: string;
  width: number;
  height: number;
  format: string;
}

export const processBrandLogoFile = (file: File): Promise<ProcessedLogoResult> => {
  return new Promise((resolve, reject) => {
    // Validate mime type
    const validMimes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'image/gif'
    ];

    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (!validMimes.includes(file.type) && !isSvg) {
      reject(new Error('Unsupported file format. Please upload an SVG, PNG, JPG, or WEBP image.'));
      return;
    }

    const reader = new FileReader();

    if (isSvg) {
      reader.onload = () => {
        const svgContent = reader.result as string;
        // If data URL or text
        if (svgContent.startsWith('data:image/svg+xml')) {
          resolve({
            dataUrl: svgContent,
            width: 200,
            height: 60,
            format: 'SVG'
          });
        } else {
          // Convert text SVG to data URL
          const base64 = btoa(unescape(encodeURIComponent(svgContent)));
          resolve({
            dataUrl: `data:image/svg+xml;base64,${base64}`,
            width: 200,
            height: 60,
            format: 'SVG'
          });
        }
      };
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsText(file);
      return;
    }

    // For raster images (PNG, JPG, WEBP), auto-resize to fit A4 invoice headers nicely
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX_WIDTH = 500;
        const MAX_HEIGHT = 200;

        let targetWidth = img.width;
        let targetHeight = img.height;

        // Auto-scale maintaining aspect ratio
        if (targetWidth > MAX_WIDTH || targetHeight > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / targetWidth, MAX_HEIGHT / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to raw data url if canvas unavailable
          resolve({
            dataUrl: reader.result as string,
            width: img.width,
            height: img.height,
            format: file.type.replace('image/', '').toUpperCase()
          });
          return;
        }

        // Enable high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Export clean transparent PNG or high quality WebP
        const resizedDataUrl = canvas.toDataURL('image/png', 0.95);
        resolve({
          dataUrl: resizedDataUrl,
          width: targetWidth,
          height: targetHeight,
          format: 'PNG'
        });
      };

      img.onerror = () => reject(new Error('Failed to load image. The file may be corrupted.'));
      img.src = reader.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
};

export const processLogoImageFile = async (file: File): Promise<string> => {
  const result = await processBrandLogoFile(file);
  return result.dataUrl;
};
