import { ChangeDetectionStrategy, Component } from "@angular/core";
import { EditCvComponent } from "./edit-cv/edit-cv";
import { EditBadge } from "@features/landing/badge/components/edit-badge/edit-badge";

@Component({
  selector: "app-dashboard",
  imports: [EditBadge, EditCvComponent],
  template: `
    <div class="flex lg:mt-24">
      <main class="flex flex-col lg:flex-row gap-2 flex-grow p-8 w-full">
        <app-edit-badge class="flex-1" />
        <app-edit-cv class="flex-1" />
      </main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
