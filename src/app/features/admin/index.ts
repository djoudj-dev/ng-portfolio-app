// Layout
export { AdminLayout } from './admin-layout';

// Routes
export * from './admin.routes';

// Core exports (data, interfaces, services only - NO components to avoid circular deps)
export * from './core/interfaces/activity.interface';
export * from './core/interfaces/counter-card.interface';
export * from './core/interfaces/navigation-link.interface';
export * from './core/data/counter-cards.data';
export * from './core/data/navigation-links.data';
export * from './core/services/admin-resource-service';
export * from './core/services/activity-service';
export { AdminSidebar } from './core/components/admin-sidebar';

// Dashboard exports (components only for external use)
export { CounterAdmin } from './features/dashboard/components/counter-admin';
export { RecentActivityComponent } from './features/dashboard/components/recent-activity';
export { AdminDashboard } from './features/dashboard/pages/dashboard.page';

// Analytics exports
export { ActivityChartComponent } from './features/analytics/components/activity-chart/activity-chart';
export { AnalyticsService } from './features/analytics/services/analytics-service';

// Messages exports
export { AdminMessagesPage } from './features/messages/pages/messages.page';

// CV exports
export { CvAdminComponent } from './features/cv/pages/cv-admin.page';

// Badge exports
export * from './features/badge';
