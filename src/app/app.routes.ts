import { Routes } from "@angular/router";
import { adminGuard } from "@core/guards/admin.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("@features/home/home").then((m) => m.Home),
  },
  {
    path: "home",
    loadComponent: () => import("@features/home/home").then((m) => m.Home),
  },
  {
    path: "admin/dashboard",
    loadComponent: () =>
      import("@features/dashboard/dashboard").then((m) => m.Dashboard),
    canActivate: [adminGuard],
  },
];
