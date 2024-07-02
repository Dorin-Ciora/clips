import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RegisterUserPayload } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.less'],
})
export class RegisterComponent {
  public isCreatingUser = false;
  public registrationForm = new FormGroup(
    {
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl(
        '',
        [Validators.required, Validators.email],
        [this.emailTaken.validate],
      ),
      age: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(18),
        Validators.max(120),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/),
      ]),
      confirm_password: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl(''),
    },
    [RegisterValidators.match('password', 'confirm_password')],
  );
  public showAlert: boolean = false;
  public alertMsg: string = 'Please wait! Your account is being created.';
  public alertColor: string = 'blue';

  constructor(
    private authSerice: AuthService,
    private emailTaken: EmailTaken,
  ) {}

  public registerUser() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    this.isCreatingUser = true;
    this.authSerice
      .registerUser(this.registrationForm.value as RegisterUserPayload)
      .then(({ alertMsg, alertColor }) => {
        this.alertMsg = alertMsg;
        this.alertColor = alertColor;
      })
      .catch(({ alertMsg, alertColor }) => {
        this.alertMsg = alertMsg;
        this.alertColor = alertColor;
        this.isCreatingUser = false;
      });
  }
}
