import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/model/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.less'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter<IClip>();

  public editForm = new FormGroup({
    clipId: new FormControl('', {
      nonNullable: true,
    }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });
  isSubmission = false;
  showAlert = false;
  alertColor = 'blue';
  alertMsg = 'Please wait! Updating clip.';

  constructor(
    private modalService: ModalService,
    private clipService: ClipService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) return;

    this.isSubmission = false;
    this.showAlert = false;
    this.editForm.setValue({
      clipId: this.activeClip.docID as string,
      title: this.activeClip.title,
    });
  }

  ngOnInit(): void {
    this.modalService.register('editClip');
  }

  ngOnDestroy(): void {
    this.modalService.unregister('editClip');
  }

  get clipIdControlValue(): string {
    return this.editForm.controls.clipId.value;
  }

  get clipTitleControlValue(): string {
    return this.editForm.controls.title.value;
  }

  async onSubmitEditClip() {
    if (!this.activeClip) return;

    (this.isSubmission = true), (this.showAlert = true);
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Updating clip.';

    try {
      await this.clipService.updateClip(
        this.clipIdControlValue,
        this.clipTitleControlValue
      );
    } catch (e) {
      this.isSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong. Try again later.';
      return;
    }
    this.activeClip.title = this.clipTitleControlValue;
    this.update.emit(this.activeClip as IClip);

    this.isSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }
}
