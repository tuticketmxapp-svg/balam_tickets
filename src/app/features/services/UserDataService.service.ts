import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private isBrowser = false;

  private localStorageChangeSubject = new BehaviorSubject<string | null>(null);
  localStorageChange$ = this.localStorageChangeSubject.asObservable();

  private userSubject = new BehaviorSubject<any>(null);
  userSubject$ = this.userSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      window.addEventListener('storage', (event) => {
        if (event.storageArea === localStorage) {
          this.localStorageChangeSubject.next(event.key);
        }
      });
    }
  }

  getItem(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  setItem(key: string, value: any): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
    this.localStorageChangeSubject.next(key);
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
    this.localStorageChangeSubject.next(key);
  }

  setUser(user: any): void {
    this.userSubject.next(user);
  }
}
