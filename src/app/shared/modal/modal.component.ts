import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.less'],
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() modalId: string = '';

  constructor(
    public modalService: ModalService,
    private elem: ElementRef
  ) {}

  ngOnInit(): void {
    // Fix styling issue. This will prevent the modal to get styling from a parent component.
    document.body.appendChild(this.elem.nativeElement);
  }

  ngOnDestroy(): void {
    document.body.removeChild(this.elem.nativeElement);
  }

  public closeModal() {
    this.modalService.toggleModal(this.modalId);
  }
}
