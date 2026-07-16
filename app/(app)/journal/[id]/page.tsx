import { createClient } from "@/lib/supabase/server";
import { Strategy, Trade, TradingAccount } from "@/types/database";
import TradeForm from "@/components/TradeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function TradeDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: trade }, { data: strategies }, { data: accounts }] = await Promise.all([
    supabase.from("trades").select("*").eq("id", params.id).eq("user_id", user!.id).single(),
    supabase.from("strategies").select("*").eq("user_id", user!.id).eq("is_active", true),
    supabase.from("trading_accounts").select("*").eq("user_id", user!.id),
  ]);

  if (!trade) notFound();

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/journal"
        className="mb-4 flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au journal
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Modifier le trade — {(trade as Trade).symbol}</h1>
      <TradeForm
        strategies={(strategies as Strategy[]) ?? []}
        accounts={(accounts as TradingAccount[]) ?? []}
        existingTrade={trade as Trade}
      />
    </div>
  );
}
