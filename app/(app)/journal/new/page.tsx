import { createClient } from "@/lib/supabase/server";
import { Strategy } from "@/types/database";
import TradeForm from "@/components/TradeForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewTradePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: strategies } = await supabase
    .from("strategies")
    .select("*")
    .eq("user_id", user!.id)
    .eq("is_active", true);

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8 md:py-8">
      <Link
        href="/journal"
        className="mb-4 flex items-center gap-2 text-sm text-textSecondary hover:text-textPrimary"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au journal
      </Link>
      <h1 className="mb-6 text-xl font-semibold">Nouveau trade</h1>
      <TradeForm strategies={(strategies as Strategy[]) ?? []} />
    </div>
  );
}
