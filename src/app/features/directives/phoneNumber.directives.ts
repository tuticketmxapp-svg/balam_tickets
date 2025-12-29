import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[phoneNumber]',
  standalone: true
})
export class PhoneNumberDirective {

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const initialValue = this.el.nativeElement.value;

    // Solo números, máximo 10 dígitos
    const sanitizedValue = initialValue
      .replace(/[^0-9]/g, '')
      .slice(0, 10);

    if (initialValue !== sanitizedValue) {
      this.el.nativeElement.value = sanitizedValue;
      event.stopPropagation();
    }
  }
}
