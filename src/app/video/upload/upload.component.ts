import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { publishFacade } from '@angular/compiler';

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
  public uploadForm = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ])
  })

  constructor(private storage: AngularFireStorage) { }

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
      this.showAlert = true;
      this.alertColor = 'blue';
      this.alertMsg = 'Please wait! Your clip is being uploaded.';
      this.isSubmission = true;
      const clipFileName = uuid();
      // For let Firebase know that we want to save to a directory called clips.
      const clipPath = `clips/${clipFileName}.mp4`;

      const task = this.storage.upload(clipPath, this.file);

      task.percentageChanges().subscribe(progress => this.percentage = progress as number / 100)
    }

}
