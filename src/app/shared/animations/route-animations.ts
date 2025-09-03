// Modern Angular animations using animate.enter and animate.leave
// CSS classes for route transitions - no deprecated trigger/transition API

// CSS class definitions for route animations
export const routeAnimationClasses = {
  // Slide animations
  slideEnterFromRight: 'slide-enter-from-right',
  slideEnterFromLeft: 'slide-enter-from-left',
  slideEnterFromBottom: 'slide-enter-from-bottom',
  slideEnterFromTop: 'slide-enter-from-top',

  slideLeaveToRight: 'slide-leave-to-right',
  slideLeaveToLeft: 'slide-leave-to-left',
  slideLeaveToBottom: 'slide-leave-to-bottom',
  slideLeaveToTop: 'slide-leave-to-top',

  // Fade animations
  fadeEnter: 'fade-enter',
  fadeLeave: 'fade-leave',

  // Scale animations
  scaleEnter: 'scale-enter',
  scaleLeave: 'scale-leave',

  // Combined effects
  slideScaleEnter: 'slide-scale-enter',
  slideScaleLeave: 'slide-scale-leave',

  // Admin specific
  adminEnter: 'admin-enter',
  adminLeave: 'admin-leave'
};

// Animation configuration type
interface AnimationConfig {
  enter: string;
  leave: string;
}

// Animation configuration for different routes
export const routeAnimationConfig: Record<string, AnimationConfig> = {
  'HomePage => ProjectsPage': {
    enter: routeAnimationClasses.slideEnterFromBottom,
    leave: routeAnimationClasses.slideLeaveToTop
  },
  'ProjectsPage => HomePage': {
    enter: routeAnimationClasses.slideEnterFromTop,
    leave: routeAnimationClasses.slideLeaveToBottom
  },
  'ContactPage': {
    enter: routeAnimationClasses.slideEnterFromBottom,
    leave: routeAnimationClasses.slideLeaveToBottom
  },
  'AdminPage': {
    enter: routeAnimationClasses.adminEnter,
    leave: routeAnimationClasses.adminLeave
  },
  'default': {
    enter: routeAnimationClasses.fadeEnter,
    leave: routeAnimationClasses.fadeLeave
  }
};

// Helper function to get animation classes for a route transition
export function getRouteAnimationClasses(fromRoute?: string, toRoute?: string): AnimationConfig {
  const transitionKey = fromRoute && toRoute ? `${fromRoute} => ${toRoute}` : 'default';

  if (routeAnimationConfig[transitionKey]) {
    return routeAnimationConfig[transitionKey];
  }

  // Check for specific to-route configurations
  if (toRoute && routeAnimationConfig[toRoute]) {
    return routeAnimationConfig[toRoute];
  }

  return routeAnimationConfig['default'];
}

// Modern page transition using CSS classes instead of deprecated trigger API
export const pageTransition = {
  getEnterClass: (route?: string): string => {
    return getRouteAnimationClasses(undefined, route).enter;
  },
  getLeaveClass: (route?: string): string => {
    return getRouteAnimationClasses(undefined, route).leave;
  }
};
