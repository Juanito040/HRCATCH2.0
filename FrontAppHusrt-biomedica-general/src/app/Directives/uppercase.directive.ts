import { Directive, HostListener, ElementRef, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  standalone: true,
  selector: '[appUppercase]'
})
export class UppercaseDirective {
  constructor(private el: ElementRef, @Optional() private control: NgControl) { }

  @HostListener('blur') onBlur() {
    this.applyUppercase();
  }

  @HostListener('change') onChange() {
    this.applyUppercase();
  }

  private applyUppercase() {
    const value = this.el.nativeElement.value.toUpperCase();
    if (this.control && this.control.control) {
      this.control.control.setValue(value, { emitEvent: false });
    }
    this.el.nativeElement.value = value;
  }
}
