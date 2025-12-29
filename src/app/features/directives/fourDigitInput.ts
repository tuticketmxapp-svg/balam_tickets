import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[fourDigitInput]',
  standalone: true
})
export class FourDigitInputDirective {

  @Output() sanitizedValueCvv = new EventEmitter<string>();

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const initialValue = this.el.nativeElement.value;
    const sanitizedValue = initialValue.replace(/[^0-9]/g, '').slice(0, 4);

    if (initialValue !== sanitizedValue) {
      this.el.nativeElement.value = sanitizedValue;
      this.sanitizedValueCvv.emit(sanitizedValue);
      event.stopPropagation();
    }
  }
}
