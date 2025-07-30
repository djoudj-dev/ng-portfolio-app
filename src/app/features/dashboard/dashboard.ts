import { ChangeDetectionStrategy, Component } from "@angular/core";
import { EditHomeBadge } from "@features/home/badge/components/edit-home-badge/edit-home-badge";
import { EditCvComponent } from "./edit-cv/edit-cv";

@Component({
  selector: "app-dashboard",
  imports: [EditHomeBadge, EditCvComponent],
  templateUrl: "./dashboard.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
