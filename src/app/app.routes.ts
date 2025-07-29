import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("@features/users/home/home").then((m) => m.Home),
  },
  {
    path: "admin/dashboard",
    loadComponent: () =>
      import("@features/admin/dashboard/dashboard").then((m) => m.Dashboard),
  },
];
