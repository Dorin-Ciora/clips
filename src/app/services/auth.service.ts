import { Injectable } from "@angular/core";
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from "rxjs";
import { delay, map } from "rxjs/operators";
import { RegisterUserPayload, RegisterUserResponse } from "../model/user.model";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isAuthenticated$: Observable<boolean>;
  isAuthenticatedWithDelay$: Observable<boolean>;
  private userCollection: AngularFirestoreCollection<RegisterUserPayload>;

  constructor(
    private firebaseAuth: AngularFireAuth,
    private database: AngularFirestore,
    private router: Router
    ) {
      this.userCollection = this.database.collection('users');
      this.isAuthenticated$ = this.firebaseAuth.user.pipe(map(user => !!user));
      this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));
    }

  public handleRegistrationError(error: string): string {

    switch (error) {
      case 'auth/email-already-in-use':
      return 'Error! The email is already in use. Please user a different email';

      default:
        return 'An unexpected error occured. Please try again later'
    }
  }

  public async registerUser(registrationForm: RegisterUserPayload): Promise<RegisterUserResponse> {
    if (!registrationForm.password) {
      return <RegisterUserResponse>{
        alertColor: 'red',
        alertMsg: 'Password not provided!'
      }
    }
    const { email, password, age, phoneNumber, name } = registrationForm;
    return await this.firebaseAuth.createUserWithEmailAndPassword(email, password).then(
      userCredentials => {
        this.userCollection.doc(userCredentials.user?.uid).set({
          name,
          email,
          age,
          phoneNumber
        })
        userCredentials.user?.updateProfile({
          displayName: name
        })
        return {
          alertMsg: 'Success! Your account has been created.',
          alertColor: 'green'
        }
      }
    ).catch(({ code }) => {
      return {
        alertMsg: this.handleRegistrationError(code),
        alertColor: 'red'
      }
    })
  }

  public async logout(event: Event) {
    event.preventDefault();

    await this.firebaseAuth.signOut();
    await this.router.navigateByUrl('/')
  }


}
