import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarClickService {
  private clickSubject = new Subject<void>();
  private titleSubject = new Subject<{
    title: string;
    icon: string;
  }>();

  clickEvent$ = this.clickSubject.asObservable();
  title = this.titleSubject.asObservable();

  sendClickEvent(data: any) {
    this.clickSubject.next(data);
  }
  setMenuActive(data: {
    title: string;
    icon: any;
  }) {
    this.titleSubject.next(data);
  }
  getTitlte() {
    return this.titleSubject;
  }


}
