import { Injectable } from '@angular/core';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { TrainingService } from '../training/training.service';
import { UIService } from '../shared/ui.service';
import { User } from 'firebase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  authChange = new Subject<boolean>();
  user: any;

  constructor(
    private router: Router,
    private fireAuth: AngularFireAuth,
    private trainingService: TrainingService,
    private uiService: UIService
  ) { }

  registerUser(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.fireAuth.createUserWithEmailAndPassword(authData.email, authData.password).then((result) => {
      this.uiService.loadingStateChanged.next(false);
      this.fireAuth.currentUser.then(user => {
        user.sendEmailVerification();
      });
    }).catch((error) => {
      this.uiService.loadingStateChanged.next(false);
      this.uiService.showSnackBar(error.message, null, 3000);
    });
  }

  initAuthListener() {
    this.fireAuth.authState.subscribe((user) => {
      if (user) {
        this.user = user;
        sessionStorage.setItem('user', JSON.stringify(user));
        this.isAuthenticated = true;
        this.authChange.next(true);
        if (this.router.url === '/login' || this.router.url === '/signup') {
          this.router.navigate(['/training']);
        }
      }
      else {
        sessionStorage.removeItem('user');
        this.trainingService.cancelSubscriptions();
        this.isAuthenticated = false;
        this.authChange.next(false);
      }
    });
  }

  login(authData: AuthData) {
    this.uiService.loadingStateChanged.next(true);
    this.fireAuth.signInWithEmailAndPassword(authData.email, authData.password).then((result) => {
      this.uiService.loadingStateChanged.next(false);
    }).catch((error) => {
      this.uiService.showSnackBar(error.message, null, 3000);
      this.uiService.loadingStateChanged.next(false);
    });
  }

  logout() {
    this.fireAuth.signOut().then((result) => {
      setTimeout(() => {
        this.router.navigate(['/login']);
        this.uiService.showSnackBar('Logged Out Successfully', null, 3000);
      }, 500);
    });
  }

  isAuth() {
    return this.isAuthenticated;
  }

  getUser() {
    return { ...this.user };
  }
}
