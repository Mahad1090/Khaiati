"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Shirt,
  HardHat,
  ClipboardList,
  Wallet,
  Scissors,
  Truck,
  ShoppingCart,
  Tags,
  CreditCard,
  Boxes,
  TrendingUp,
  Receipt,
  LineChart,
  BarChart3,
  UserCog,
  Settings,
  Building2,
  Store,
  Star,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/lib/i18n/language-context";
import { can, type Capability, type Role } from "@/lib/permissions";

// title/label here are dictionary keys into t.adminNav.items / t.adminNav.groups,
// not the displayed text itself — see AppSidebar below.
type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  // Capability required for a business-staff user (storekeeper/accountant/
  // employee/manager) to see this item. Undefined = always visible once the
  // surrounding group is visible (e.g. Dashboard). Platform-only groups are
  // hidden for business staff entirely, regardless of this field.
  capability?: Capability;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Platform",
    items: [{ title: "Businesses", href: "/admin/businesses", icon: Building2 }],
  },
  {
    label: "Tailoring",
    items: [
      { title: "Customers", href: "/admin/customers", icon: Users, capability: "customers:view" },
      { title: "Orders", href: "/admin/orders", icon: ShoppingBag, capability: "orders:view" },
      { title: "Designs", href: "/admin/designs", icon: Shirt, capability: "catalog:view" },
      { title: "Services", href: "/admin/services", icon: Tags, capability: "catalog:view" },
    ],
  },
  {
    label: "Workers",
    items: [
      { title: "Workers", href: "/admin/workers", icon: HardHat, capability: "workers:view" },
      { title: "Work Assignments", href: "/admin/work-assignments", icon: ClipboardList, capability: "workers:edit" },
      { title: "Salaries & Wages", href: "/admin/salaries", icon: Wallet, capability: "payroll:edit" },
    ],
  },
  {
    label: "Fabric Store",
    items: [
      { title: "Fabrics", href: "/admin/fabrics", icon: Scissors, capability: "fabrics:view" },
      { title: "Suppliers", href: "/admin/suppliers", icon: Truck, capability: "purchases:edit" },
      { title: "Purchases", href: "/admin/fabric-purchases", icon: ShoppingCart, capability: "purchases:edit" },
      { title: "Supplier Debts", href: "/admin/supplier-debts", icon: CreditCard, capability: "purchases:edit" },
      { title: "Fabric Sales", href: "/admin/fabric-sales", icon: Tags, capability: "sales:edit" },
      { title: "Inventory", href: "/admin/inventory", icon: Boxes, capability: "fabrics:view" },
      { title: "Products", href: "/admin/products", icon: ShoppingCart, capability: "fabrics:view" },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Income", href: "/admin/income", icon: TrendingUp, capability: "finance:view" },
      { title: "Expenses", href: "/admin/expenses", icon: Receipt, capability: "finance:view" },
      { title: "Profit & Loss", href: "/admin/profit-loss", icon: LineChart, capability: "finance:view" },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3, capability: "reports:view" },
      { title: "Reviews", href: "/admin/reviews", icon: Star, capability: "reports:view" },
    ],
  },
  {
    label: "Administration",
    items: [
      { title: "Users", href: "/admin/users", icon: UserCog },
      { title: "Subscription Plans", href: "/admin/subscription-plans", icon: CreditCard },
      { title: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

// Platform-level concerns (approving other businesses, whole-system env
// status/backup, the cross-business role matrix) are never shown to a
// business's own staff — only to platform admins.
const PLATFORM_ONLY_GROUPS = new Set(["Platform", "Administration"]);

function getBusinessProfileGroup(isOwner: boolean): NavGroup {
  return {
    label: "My Business",
    items: [
      { title: "Team", href: "/admin/team", icon: Users },
      ...(isOwner
        ? [
            { title: "Business Profile", href: "/admin/business-profile", icon: Store },
            { title: "Subscription", href: "/admin/subscription", icon: CreditCard },
          ]
        : []),
    ],
  };
}

export function AppSidebar({
  hidePlatformGroup = false,
  isOwner = true,
  role,
}: {
  hidePlatformGroup?: boolean;
  isOwner?: boolean;
  // The signed-in business staff member's role (manager/accountant/
  // storekeeper/employee). Only meaningful when hidePlatformGroup is true —
  // platform admins always see every item. Defaults to "manager" (today's
  // unrestricted behavior) so existing callers that don't pass a role are
  // unaffected.
  role?: Role;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const groupLabels: Record<string, string> = t.adminNav.groups;
  const itemTitles: Record<string, string> = t.adminNav.items;
  const effectiveRole: Role = role ?? "manager";

  const visibleGroups = hidePlatformGroup
    ? [
        ...navGroups
          .filter((g) => !PLATFORM_ONLY_GROUPS.has(g.label))
          .map((g) => ({
            ...g,
            items: g.items.filter((item) => !item.capability || can(effectiveRole, item.capability)),
          }))
          .filter((g) => g.items.length > 0),
        getBusinessProfileGroup(isOwner),
      ]
    : navGroups;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/admin"
          className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-sidebar-primary text-sidebar-primary-foreground font-serif text-sm tracking-widest">
            K
          </span>
          <span className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-serif text-sm tracking-[0.2em] uppercase">
              Khaiati
            </span>
            <span className="text-[10px] tracking-[0.2em] uppercase text-sidebar-foreground/60">
              {t.adminNav.brandSubtitle}
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{groupLabels[group.label] ?? group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={itemTitles[item.title] ?? item.title}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{itemTitles[item.title] ?? item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1.5 text-[11px] text-sidebar-foreground/50 group-data-[collapsible=icon]:hidden">
          {t.adminNav.footer}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
