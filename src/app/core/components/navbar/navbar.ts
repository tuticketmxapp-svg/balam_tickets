import { Component } from '@angular/core';
import { LocalStorageService } from '../../../features/services/UserDataService.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule,RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {
  me: any;
  constructor(
    private localStorageService: LocalStorageService,
  ) {

  }
  ngOnInit(): void {
    this.onActivate();

  }
  onActivate() {
    const userData = this.localStorageService.getItem('user_data');

    if (userData) {
      this.me = JSON.parse(userData);
    } else {
      this.me = null;
    }
    console.log('this.me',this.me)
  }
}
