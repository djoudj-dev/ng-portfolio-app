import { Directive, computed } from "@angular/core";
import { input } from "@angular/core";

@Directive({
  selector: "[appHoverClass]",
  host: {
    "[class]": "computedClasses()",
  },
})
export class HoverClassBehaviorDirective {
  readonly hoverClass = input<string>("hover:scale-105 hover:shadow-md");
  readonly baseClass = input<string>("");
  readonly transitionClass = input<string>(
    "transition-all duration-300 ease-in-out",
  );

  readonly computedClasses = computed(() => {
    return `${this.baseClass()} ${this.transitionClass()} ${this.hoverClass()}`
      .trim()
      .replace(/\s+/g, " ");
  });
}
