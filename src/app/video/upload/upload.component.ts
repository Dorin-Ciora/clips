import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
import { combineLatest, forkJoin } from 'rxjs';
import { ImageSizeService } from 'src/app/services/image-size.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less'],
})
export class UploadComponent implements OnDestroy {
  public isDragOver: boolean = false;
  public file: File | null = null;
  public nextStep: boolean = false;
  public showAlert: boolean = false;
  public alertColor: string = 'blue';
  public alertMsg: string = 'Please wait! Your clip is being uploaded.';
  public isSubmission: boolean = false;
  public percentage: number = 0;
  public showPercentage: boolean = false;
  private user: firebase.User | null = null;
  private task?: AngularFireUploadTask;
  public uploadForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });
  public screenshots: string[] = [];
  public selectedScreenshot = '';
  public screenShotTask?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService,
    private imageSizeService: ImageSizeService,
  ) {
    this.auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  public async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragOver = false;
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files.item(0) ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];

    this.uploadForm.controls.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, ''),
    );
    this.nextStep = true;
  }

  public cancelUpload(): void {
    this.screenshots = [];
    this.nextStep = false;
    this.isSubmission = false;
  }

  public async uploadFile() {
    this.uploadForm.disable();
    this.showPercentage = true;
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your clip is being uploaded.';
    this.isSubmission = true;
    const clipFileName = uuid();
    // For let Firebase know that we want to save to a directory called clips.
    const clipPath = `clips/${clipFileName}.mp4`;
    const screenshootBlob = await this.ffmpegService.bloblFromURL(
      this.selectedScreenshot,
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);
    this.screenShotTask = this.storage.upload(screenshotPath, screenshootBlob);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenShotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) {
        return;
      }
      const totalProgress = clipProgress + screenshotProgress;
      this.percentage = (totalProgress as number) / 200;
    });
    // Read the last state value from the uploading process.
    forkJoin([
      this.task.snapshotChanges(),
      this.screenShotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()]),
        ),
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL, screenshotURL] = urls;
          const { width, height } =
            await this.imageSizeService.getImageSize(screenshotURL);
          const hasPriority = this.imageSizeService.shouldAddPriority(
            width,
            height,
          );
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.uploadForm.controls.title.value as string,
            fileName: `${clipFileName}.mp4`,
            url: clipURL,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            screenshotURL,
            screenshotFileName: `${clipFileName}.png`,
            hasPriority,
          };

          const clipDocRef = await this.clipService.createClip(clip);

          this.showPercentage = false;
          this.alertColor = 'green';
          this.alertMsg =
            'Success! Your clip is now ready to share with the world.';

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1000);
        },
        error: (error) => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = 'Upload failed! Please try again later.';
          this.isSubmission = false;
          this.showPercentage = false;
          console.error(error);
        },
      });
  }
}
