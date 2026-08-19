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

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
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
      { title: "Customers", href: "/admin/customers", icon: Users },
      { title: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { title: "Designs", href: "/admin/designs", icon: Shirt },
      { title: "Services", href: "/admin/services", icon: Tags },
    ],
  },
  {
    label: "Workers",
    items: [
      { title: "Workers", href: "/admin/workers", icon: HardHat },
      { title: "Work Assignments", href: "/admin/work-assignments", icon: ClipboardList },
      { title: "Salaries & Wages", href: "/admin/salaries", icon: Wallet },
    ],
  },
  {
    label: "Fabric Store",
    items: [
      { title: "Fabrics", href: "/admin/fabrics", icon: Scissors },
      { title: "Suppliers", href: "/admin/suppliers", icon: Truck },
      { title: "Purchases", href: "/admin/fabric-purchases", icon: ShoppingCart },
      { title: "Supplier Debts", href: "/admin/supplier-debts", icon: CreditCard },
      { title: "Fabric Sales", href: "/admin/fabric-sales", icon: Tags },
      { title: "Inventory", href: "/admin/inventory", icon: Boxes },
      { title: "Products", href: "/admin/products", icon: ShoppingCart },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Income", href: "/admin/income", icon: TrendingUp },
      { title: "Expenses", href: "/admin/expenses", icon: Receipt },
      { title: "Profit & Loss", href: "/admin/profit-loss", icon: LineChart },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Reports", href: "/admin/reports", icon: BarChart3 },
      { title: "Reviews", href: "/admin/reviews", icon: Star },
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

// Employees (non-owner business staff) never see revenue/expenses per doc
// §36 — only the business owner does.
const OWNER_ONLY_GROUPS = new Set(["Finance"]);

export function AppSidebar({
  hidePlatformGroup = false,
  isOwner = true,
}: {
  hidePlatformGroup?: boolean;
  isOwner?: boolean;
}) {
  const pathname = usePathname();
  const visibleGroups = hidePlatformGroup
    ? [
        ...navGroups.filter(
          (g) => !PLATFORM_ONLY_GROUPS.has(g.label) && (isOwner || !OWNER_ONLY_GROUPS.has(g.label))
        ),
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
              Management
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active =
                    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
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
          Khaiati Tailoring &amp; Fabric System
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
