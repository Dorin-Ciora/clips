import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.less']
})
export class UploadComponent implements OnInit {
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
  public uploadForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ])
  })

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService)
    {
    this.auth.user.subscribe(user => this.user = user)
  }

  ngOnInit(): void {
  }
    public storeFile($event: Event) {
      this.isDragOver = false;
      this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null;

      if (!this.file || this.file.type !== 'video/mp4') {
        return
      }
      this.uploadForm.controls.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''))
      this.nextStep = true;
    }

    public uploadFile() {
      this.showPercentage = true;
      this.showAlert = true;
      this.alertColor = 'blue';
      this.alertMsg = 'Please wait! Your clip is being uploaded.';
      this.isSubmission = true;
      const clipFileName = uuid();
      // For let Firebase know that we want to save to a directory called clips.
      const clipPath = `clips/${clipFileName}.mp4`;

      const task = this.storage.upload(clipPath, this.file);
      const clipRef = this.storage.ref(clipPath);

      task.percentageChanges().subscribe(progress => this.percentage = progress as number / 100);
      // Read the last state value from the uploading process.
      task.snapshotChanges().pipe(
        last(),
        switchMap(() => clipRef.getDownloadURL())).subscribe({
        next: (url) => {
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.uploadForm.controls.title.value as string,
            fileName: `${clipFileName}.mp4`,
            url
          }

          this.clipService.createClip(clip);

          this.showPercentage = false;
          this.alertColor = 'green';
          this.alertMsg = 'Success! Your clip is now ready to share with the world.'
        },
        error: (error) => {
          this.alertColor = 'red';
          this.alertMsg = 'Upload failed! Please try again later.'
          this.isSubmission = true;
          this.showPercentage = false;
          console.error(error)
        }
      })
    }

}
