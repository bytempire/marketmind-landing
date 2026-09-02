import {
  BarChart3,
  CheckSquare,
  Users,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  MessageSquare,
  Package,
  Settings,
  Shield,
  Store,
  Star,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const APP_NAV: NavItem[] = [
  { href: "/dashboard", label: "Дашборд", icon: LayoutDashboard },
  { href: "/commerce", label: "Коммерция", icon: TrendingUp },
  { href: "/marketing", label: "Маркетинг", icon: Megaphone },
  { href: "/reviews", label: "Отзывы", icon: Star },
  { href: "/questions", label: "Вопросы", icon: MessageSquare },
  { href: "/products", label: "Товары", icon: Package },
  { href: "/analytics", label: "Аналитика", icon: BarChart3 },
  { href: "/insights", label: "AI-менеджер", icon: Lightbulb },
  { href: "/tasks", label: "Задачи", icon: CheckSquare },
  { href: "/team", label: "Команда", icon: Users },
  { href: "/marketplaces", label: "Кабинеты", icon: Store },
  { href: "/billing", label: "Тариф", icon: CreditCard },
  { href: "/settings", label: "Настройки", icon: Settings },
];

export const ADMIN_NAV_ITEM: NavItem = {
  href: "/admin",
  label: "Админка",
  icon: Shield,
};

export function getAppNavItems(role?: string | null): NavItem[] {
  return role === "admin" ? [...APP_NAV, ADMIN_NAV_ITEM] : APP_NAV;
}

export function isNavItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
