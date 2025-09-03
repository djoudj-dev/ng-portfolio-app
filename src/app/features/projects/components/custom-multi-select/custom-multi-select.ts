import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgOptimizedImage } from "@angular/common";
import { Technology } from "@features/projects/data/technologies";

@Component({
  selector: "app-custom-multi-select",
  imports: [NgOptimizedImage],
  templateUrl: "./custom-multi-select.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomMultiSelectComponent),
      multi: true,
    },
  ],
})
export class CustomMultiSelectComponent implements ControlValueAccessor {
  options = input<Technology[]>([]);

  selectedOptions = signal<string[]>([]);
  isOpen = signal(false);

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[]): void {
    this.selectedOptions.set(value || []);
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggleSelection(optionName: string): void {
    const currentSelection = this.selectedOptions();
    const newSelection = currentSelection.includes(optionName)
      ? currentSelection.filter((name) => name !== optionName)
      : [...currentSelection, optionName];

    this.selectedOptions.set(newSelection);
    this.onChange(newSelection);
  }

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
    if (!this.isOpen()) {
      this.onTouched();
    }
  }

  isOptionSelected(optionName: string): boolean {
    return this.selectedOptions().includes(optionName);
  }
}
