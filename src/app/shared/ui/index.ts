// Export all UI components for easier imports
export { NavbarComponent } from './navbar/navbar';
export { LoginForm } from '@shared/ui/login/login-form/login-form';
export { LoginModal } from '@shared/ui/login/login-modal/login-modal';
export { Toast } from './toast/toast';
export { ToastContainer } from './toast/toast-container';

// Export feature components
export { SkillsComponent, SkillsPageComponent } from '../../features/skills';

// Export services
export { AuthService } from '@core/services/auth';
export { ToastService } from './toast/service/toast-service';

// Export types
export type { LoginRequest, User, AuthState, AuthResponse } from '@core/interfaces';
export type { CvMetadata, UploadCvResponse } from '../../features/cv/interfaces/cv';
export type { ToastData, ToastType, ToastConfig } from './toast/interface/toast';
