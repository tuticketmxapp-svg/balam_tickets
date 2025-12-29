import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[appTwoDigitInput]',
  standalone: true
})
export class TwoDigitInputDirective {

  @Output() sanitizedValueExpiration = new EventEmitter<string>();

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event): void {
    const initialValue = this.el.nativeElement.value;

    // Solo números, máximo 2 dígitos
    const sanitizedValue = initialValue
      .replace(/[^0-9]/g, '')
      .slice(0, 2);

    if (initialValue !== sanitizedValue) {
      this.el.nativeElement.value = sanitizedValue;
      this.sanitizedValueExpiration.emit(sanitizedValue);
      event.stopPropagation();
    }
  }
}
