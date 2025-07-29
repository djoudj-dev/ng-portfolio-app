import { ChangeDetectionStrategy, Component } from "@angular/core";
import { EditHomeBadge } from "@features/admin/edit-home-badge/edit-home-badge";

@Component({
  selector: "app-dashboard",
  imports: [EditHomeBadge],
  templateUrl: "./dashboard.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {}
