import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {

  public handleRegistrationError(error: string): string {

    switch (error) {
      case 'auth/email-already-in-use':
      return 'Error! The email is already in use. Please user a different email';

      default:
        return 'An unexpected error occured. Please try again later'
    }
  }
}
