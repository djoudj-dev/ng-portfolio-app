import { Component, inject } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Router } from "@angular/router";
import { AboutMain } from "./about-main/about-main";

@Component({
  selector: "app-about",
  imports: [AboutMain, NgOptimizedImage],
  templateUrl: "./about.html",
})
export class About {
  private readonly router = inject(Router);

  navigateToSkills(): void {
    this.router.navigate(["/skills"]);
  }
}