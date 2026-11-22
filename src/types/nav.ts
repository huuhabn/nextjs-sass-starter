export type NavIcon =
  | 'alertCircle'
  | 'warning'
  | 'arrowRight'
  | 'check'
  | 'checks'
  | 'circleCheck'
  | 'close'
  | 'clock'
  | 'code'
  | 'dots'
  | 'ellipsis'
  | 'externalLink'
  | 'help'
  | 'info'
  | 'spinner'
  | 'search'
  | 'settings'
  | 'trash'
  | 'chevronDown'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronUp'
  | 'chevronsDown'
  | 'chevronsLeft'
  | 'chevronsRight'
  | 'chevronsUpDown'
  | 'dashboard'
  | 'kanban'
  | 'panelLeft'
  | 'panelLeftClose'
  | 'panelLeftOpen'
  | 'user'
  | 'user2'
  | 'account'
  | 'profile'
  | 'employee'
  | 'userPen'
  | 'teams'
  | 'github'
  | 'twitter'
  | 'logo'
  | 'chat'
  | 'notification'
  | 'phone'
  | 'video'
  | 'send'
  | 'paperclip'
  | 'page'
  | 'post'
  | 'fileTypePdf'
  | 'fileTypeDoc'
  | 'fileTypeXls'
  | 'fileZip'
  | 'media'
  | 'music'
  | 'add'
  | 'edit'
  | 'upload'
  | 'share'
  | 'login'
  | 'logout'
  | 'gripVertical'
  | 'circle'
  | 'circleX'
  | 'plusCircle'
  | 'xCircle'
  | 'minus'
  | 'sun'
  | 'moon'
  | 'brightness'
  | 'laptop'
  | 'palette'
  | 'billing'
  | 'creditCard'
  | 'product'
  | 'pro'
  | 'exclusive'
  | 'sparkles'
  | 'badgeCheck'
  | 'lock'
  | 'trendingDown'
  | 'trendingUp'
  | 'eyeOff'
  | 'adjustments'
  | 'bold'
  | 'italic'
  | 'underline'
  | 'text'
  | 'toastSuccess'
  | 'toastInfo'
  | 'toastWarning'
  | 'toastError'
  | 'toastLoading'
  | 'globe'
  | 'pizza'
  | 'workspace'
  | 'forms'
  | 'slash'
  | 'calendar'
  | 'galleryVerticalEnd'
  | 'moreHorizontal';

export interface PermissionCheck {
  permission?: string;
  plan?: string;
  feature?: string;
  role?: string;
  requireOrg?: boolean;
}

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: NavIcon;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
  access?: PermissionCheck;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;
