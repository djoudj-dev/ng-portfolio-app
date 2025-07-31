import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { AboutCardMindset } from "../about-card-mindset/about-card-mindset";
import { AboutBadgeTech } from "../about-badge-tech/about-badge-tech";
import { AboutObjectiveCard } from "../about-objective-card/about-objective-card";
import { AboutHero } from "../about-hero/about-hero";
import { ABOUT_MAIN_DATA } from "./data/about-main-data";

@Component({
  selector: "app-about-main",
  imports: [
    NgOptimizedImage,
    AboutCardMindset,
    AboutBadgeTech,
    AboutObjectiveCard,
    AboutHero,
  ],
  templateUrl: "./about-main.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutMain {
  aboutMainData = ABOUT_MAIN_DATA;
}
