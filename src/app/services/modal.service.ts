import { Injectable } from '@angular/core';
import { Modal } from '../model/modal.model';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: Modal[] = [];

  constructor() { }

  public isModalOpen(id: string): boolean {
    return Boolean(this.modals.find(modal => modal.id === id)?.visible)
  }

  public toggleModal(id: string) {
    const modal = this.modals.find(modal => modal.id === id);
    if (modal) modal.visible = !modal.visible
  }

  public register(id: string) {
    this.modals.push({
      id,
      visible: false
    })
  }

  public unregister(id: string) {
    this.modals = this.modals.filter(modal => modal.id !== id);
  }
}
