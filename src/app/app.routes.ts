import { Routes } from "@angular/router";
import { adminGuard } from "@core/guards/admin-guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("@features/landing/landing").then((m) => m.Landing),
  },
  {
    path: "landing",
    loadComponent: () =>
      import("@features/landing/landing").then((m) => m.Landing),
  },
  {
    path: "about",
    loadComponent: () => import("@features/about/about").then((m) => m.About),
  },
  {
    path: "admin/dashboard",
    loadComponent: () =>
      import("@features/admin/dashboard/dashboard").then((m) => m.Dashboard),
    canActivate: [adminGuard],
  },
];
