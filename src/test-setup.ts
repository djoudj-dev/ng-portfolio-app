import "@angular/compiler";
import "@analogjs/vitest-angular/setup-zone";

import { registerLocaleData } from "@angular/common";
import localeFr from "@angular/common/locales/fr";
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from "@angular/platform-browser/testing";
import { getTestBed } from "@angular/core/testing";

registerLocaleData(localeFr);

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);
