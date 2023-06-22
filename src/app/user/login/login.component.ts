import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less']
})
export class LoginComponent implements OnInit {
  public showAlert: boolean = false;
  public isUserLogingIn = false;
  public alertColor: string = "";
  public alertMsg: string = "";
  public credentials = {
    email: "",
    password: ""
  }

  constructor(private firebaseAuth: AngularFireAuth) { }

  ngOnInit(): void {
  }

  public login() {
    console.log('cred', this.credentials)
    this.isUserLogingIn = true;
    this.showAlert = true;
    this.alertMsg = 'Please wait! You are being loged in.';
    this.alertColor = 'blue';
    this.firebaseAuth.signInWithEmailAndPassword(
      this.credentials.email, this.credentials.password
    ).then(() => {
      this.alertColor = 'green';
      this.alertMsg = 'Success'
    }).catch(() => {
      this.alertColor = 'red';
      this.alertMsg = 'Error! Password or username invalid!';
      this.isUserLogingIn = false;
    })
  }

}
