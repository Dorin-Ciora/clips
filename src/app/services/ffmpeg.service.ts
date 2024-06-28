import { Injectable } from '@angular/core';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isReady = false;
  private ffmpeg

  constructor() {
    this.ffmpeg = createFFmpeg({ log: true })
   }

   async init(): Promise<void> {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();

    this.isReady = true;
   }

   async getScreenshots(file: File): Promise<string[]> {
     const data = await fetchFile(file);
     const seconds = [1, 2, 3];
     const comands: string[] = []
     const screenshots: string[] = [];

     this.ffmpeg.FS('writeFile', file.name, data);

     seconds.forEach(second => {
      comands.push('-i', file.name, '-ss', `00:00:0${second}`, '-frames:v', '1', '-filter:v', 'scale=510:-1', `output_0${second}.png`)
     })

     await this.ffmpeg.run(...comands);
     seconds.forEach(second => {
      const screenShotFile = this.ffmpeg.FS('readFile', `output_0${second}.png`);
      const screenShotBlob = new Blob([screenShotFile.buffer], {
        type: 'image/png'
      })
      const screeShotURL = URL.createObjectURL(screenShotBlob)
      screenshots.push(screeShotURL)
     })

     return screenshots;
   }
}
