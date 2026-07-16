import { createClient } from "@/lib/supabase/server";
import { Trade, TradingAccount } from "@/types/database";
import Link from "next/link";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";
import AccountSelector from "@/components/AccountSelector";
import DeleteTradeInlineButton from "@/components/DeleteTradeInlineButton";

export default async function JournalPage({
  searchParams,
}: {
  searchParams: { account?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const selectedAccount = searchParams.account ?? "";

  const [{ data: trades }, { data: accounts }] = await Promise.all([
    supabase
      .from("trades")
      .select("*")
      .eq("user_id", user!.id)
      .order("entry_time", { ascending: false }),
    supabase.from("trading_accounts").select("*").eq("user_id", user!.id),
  ]);

  const accountsList = (accounts as TradingAccount[]) ?? [];
  const t = ((trades as Trade[]) ?? []).filter(
    (trade) => !selectedAccount || trade.account_id === selectedAccount
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Journal de trading</h1>
          <p className="text-sm text-textSecondary">{t.length} trade(s) enregistré(s)</p>
        </div>
        <Link
          href="/journal/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Nouveau trade
        </Link>
      </div>

      <AccountSelector accounts={accountsList} />

      {t.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="mb-4 text-sm text-textSecondary">
            Aucun trade enregistré pour l'instant.
          </p>
          <Link href="/journal/new" className="text-sm text-primary hover:underline">
            Ajouter votre premier trade
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left text-xs text-textSecondary">
                <th className="px-4 py-3 font-normal">Actif</th>
                <th className="px-4 py-3 font-normal">Sens</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Statut</th>
                <th className="px-4 py-3 text-right font-normal">Résultat (R)</th>
                <th className="px-4 py-3 text-right font-normal"></th>
              </tr>
            </thead>
            <tbody>
              {t.map((trade) => (
                <tr key={trade.id} className="border-b border-border last:border-0 hover:bg-surfaceHover">
                  <td className="px-4 py-3">
                    <Link href={`/journal/${trade.id}`} className="font-medium hover:text-primary">
                      {trade.symbol}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "flex items-center gap-1 text-xs",
                        trade.direction === "long" ? "text-profit" : "text-loss"
                      )}
                    >
                      {trade.direction === "long" ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {trade.direction === "long" ? "Achat" : "Vente"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-textSecondary">
                    {new Date(trade.entry_time).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "rounded-full px-2.5 py-1 text-xs",
                        trade.status === "open" && "bg-primary/10 text-primary",
                        trade.status === "closed" && "bg-textSecondary/10 text-textSecondary",
                        trade.status === "cancelled" && "bg-loss/10 text-loss"
                      )}
                    >
                      {trade.status === "open" ? "Ouvert" : trade.status === "closed" ? "Clôturé" : "Annulé"}
                    </span>
                  </td>
                  <td
                    className={clsx(
                      "px-4 py-3 text-right font-medium",
                      trade.result_amount !== null &&
                        (trade.result_amount >= 0 ? "text-profit" : "text-loss")
                    )}
                  >
                    {trade.result_amount !== null
                      ? `${trade.result_amount >= 0 ? "+" : ""}${trade.result_amount.toFixed(2)}R`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteTradeInlineButton tradeId={trade.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
