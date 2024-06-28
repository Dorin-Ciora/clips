import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
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
  private user: firebase.User | null = null
  private task?: AngularFireUploadTask
  public uploadForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ])
  })
  public screenshots: string[] = [];

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService)
    {
    this.auth.user.subscribe(user => this.user = user);
    this.ffmpegService.init();
  }

    ngOnDestroy(): void {
      this.task?.cancel();
  }

    public async storeFile($event: Event) {
      this.isDragOver = false;
      this.file = ($event as DragEvent).dataTransfer ?
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null;

      if (!this.file || this.file.type !== 'video/mp4') {
        return
      }

      this.screenshots = await this.ffmpegService.getScreenshots(this.file);

      this.uploadForm.controls.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''))
      this.nextStep = true;
    }

    public uploadFile() {
      this.uploadForm.disable();
      this.showPercentage = true;
      this.showAlert = true;
      this.alertColor = 'blue';
      this.alertMsg = 'Please wait! Your clip is being uploaded.';
      this.isSubmission = true;
      const clipFileName = uuid();
      // For let Firebase know that we want to save to a directory called clips.
      const clipPath = `clips/${clipFileName}.mp4`;

      this.task = this.storage.upload(clipPath, this.file);
      const clipRef = this.storage.ref(clipPath);

      this.task.percentageChanges().subscribe(progress => this.percentage = progress as number / 100);
      // Read the last state value from the uploading process.
      this.task.snapshotChanges().pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())).subscribe({
        next: async (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.uploadForm.controls.title.value as string,
            fileName: `${clipFileName}.mp4`,
            url,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }

          const clipDocRef = await this.clipService.createClip(clip);

          this.showPercentage = false;
          this.alertColor = 'green';
          this.alertMsg = 'Success! Your clip is now ready to share with the world.'

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id])
          }, 1000)
        },
        error: (error) => {
          this.uploadForm.enable();
          this.alertColor = 'red';
          this.alertMsg = 'Upload failed! Please try again later.'
          this.isSubmission = true;
          this.showPercentage = false;
          console.error(error);
        }
      })
    }

}
