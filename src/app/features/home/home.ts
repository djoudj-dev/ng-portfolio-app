import { Component } from "@angular/core";
import { HomeBanner } from "@features/home/badge/components/home-banner/home-banner";
import { HomeIntro } from "@features/home/home-intro/home-intro";

@Component({
  selector: "app-home",
  imports: [HomeBanner, HomeIntro],
  template: `
    <main id="home">
      <app-home-banner />
      <app-home-intro />
    </main>
  `,
})
export class Home {}


