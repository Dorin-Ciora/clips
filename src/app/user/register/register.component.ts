import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less']
})
export class RegisterComponent {
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

  public registerUser() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
  }
}
