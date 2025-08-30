import { Component, inject, ChangeDetectionStrategy } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import { AboutMain } from "./components/about-main";

@Component({
  selector: "app-about",
  imports: [AboutMain, NgOptimizedImage],
  templateUrl: "./about.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  private readonly router = inject(Router);

  navigateToSkills(): void {
    this.router.navigate(["/skills"]);
  }
}
