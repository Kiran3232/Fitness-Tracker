import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sidenav-list',
  templateUrl: './sidenav-list.component.html',
  styleUrls: ['./sidenav-list.component.css']
})
export class SidenavListComponent implements OnInit, OnDestroy {

  @Output()
  sideNavToggle = new EventEmitter<void>()
  isLoggedIn: boolean = false;
  authSubscription: Subscription;

  constructor(
    private authService: AuthService
  ) { }

  ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.authSubscription = this.authService.authChange.subscribe((authStatus) => {
      this.isLoggedIn = authStatus;
    })
  }

  toggleSideNav() {
    this.sideNavToggle.emit();
  }

  onLogout() {
    this.toggleSideNav();
    this.authService.logout();
  }

}
