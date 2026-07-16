"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { TradingAccount } from "@/types/database";
import { Wallet } from "lucide-react";

export default function AccountSelector({ accounts }: { accounts: TradingAccount[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentAccount = searchParams.get("account") ?? "";

  if (accounts.length === 0) return null;

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("account", value);
    } else {
      params.delete("account");
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-4 flex items-center gap-2">
      <Wallet className="h-4 w-4 text-textSecondary" />
      <select
        value={currentAccount}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-primary"
      >
        <option value="">Tous les comptes</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.name}
          </option>
        ))}
      </select>
    </div>
  );
}
