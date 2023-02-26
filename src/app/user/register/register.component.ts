import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { RegistrationService } from 'src/app/services/registration.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent {
  public isCreatingUser = false;
  public registrationForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    email: new FormControl('', [
      Validators.required,
      Validators.email
    ]),
    age: new FormControl('', [
      Validators.required,
      Validators.min(18),
      Validators.max(120)
    ]),
    password: new FormControl('', [
      Validators.required,
      Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')
    ]),
    confirm_password: new FormControl('', [
      Validators.required
    ]),
    phoneNumber: new FormControl('')
  })
  public showAlert: boolean = false;
  public alertMsg: string = 'Please wait! Your account is being created.'
  public alertColor: string = 'blue';

  constructor(private auth: AngularFireAuth, private registrationService: RegistrationService) { }

  public registerUser() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    const { email, password } = this.registrationForm.value;
    this.isCreatingUser = true;

    this.auth.createUserWithEmailAndPassword(email as string, password as string).then(
      userCredential => {
        this.alertMsg = 'Success! Your account has been created.'
        this.alertColor = 'green';
        console.log('user', userCredential)
        this.isCreatingUser = false;
      }
    ).catch(({ code }) => {
      console.log('user', code);
      this.alertMsg = this.registrationService.handleRegistrationError(code);
      this.alertColor = 'red';
      this.isCreatingUser = false;
    })
  }
}
