import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from "rxjs/operators";
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.less']
})
export class NavComponent implements OnInit {
  public isAuthenticated$: Observable<boolean>;

  constructor(public modalService: ModalService, private authService: AuthService, private angularFirebaseAuth: AngularFireAuth) {
    this.isAuthenticated$ = this.authService.isAuthenticated$.pipe(map(user => !!user));
  }

  ngOnInit(): void {
  }

  public openModal($event: Event) {
    $event.preventDefault();
    this.modalService.toggleModal('auth');
  }

  public async logout(event: Event) {
    event.preventDefault();

    await this.angularFirebaseAuth.signOut()
  }

}
