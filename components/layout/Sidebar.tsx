"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Calculator,
  FileText,
  Sun,
  Brain,
  Settings,
  LogOut,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/stats", label: "Statistiques", icon: BarChart3 },
  { href: "/calculator", label: "Calculateur", icon: Calculator },
  { href: "/plan", label: "Plan & stratégies", icon: FileText },
  { href: "/rituals", label: "Rituels", icon: Sun },
  { href: "/behavior", label: "Comportement", icon: Brain },
  { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          <Image src="/icon.png" alt="MyTradEdge" width={32} height={32} />
        </div>
        <span className="font-semibold">MyTradEdge</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-textSecondary hover:bg-surfaceHover hover:text-textPrimary"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-textSecondary transition hover:bg-surfaceHover hover:text-loss"
        >
          <LogOut className="h-4 w-4" />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}
