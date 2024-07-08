import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageSizeService {
  constructor() {}

  getImageSize(imageUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = (error) => {
        reject(error);
      };
      img.src = imageUrl;
    });
  }

  shouldAddPriority(width: number, height: number): boolean {
    return width > 1000 || height > 1000;
  }
}
