import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[cardValidation]',
  standalone: true,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: CardValidationDirective,
    multi: true
  }]
})
export class CardValidationDirective implements ControlValueAccessor {

  private onChange = (_: any) => {};
  private onTouched = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {}

  writeValue(value: string): void {
    this.el.nativeElement.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @HostListener('input')
  onInput() {
    const sanitized = this.el.nativeElement.value
      .replace(/[^0-9]/g, '')
      .slice(0, 16);

    this.el.nativeElement.value = sanitized;
    this.onChange(sanitized);
  }
}

