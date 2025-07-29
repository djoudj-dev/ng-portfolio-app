import { Component } from "@angular/core";
import { HomeBanner } from "./home-banner/home-banner";

@Component({
  selector: "app-home",
  imports: [HomeBanner],
  template: ` <app-home-banner /> `,
})
export class Home {}
