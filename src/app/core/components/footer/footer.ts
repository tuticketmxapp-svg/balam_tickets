import { Component, signal } from '@angular/core';
import { ModalComponent } from './modal';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class FooterComponent {
  isModalVisible = signal(false);

  showTerms() {
    this.isModalVisible.set(true);
  }
 
  hideTerms() {
    this.isModalVisible.set(false);
  }
}