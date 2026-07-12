import { createClient } from "@/lib/supabase/server";
import {
  Profile,
  TradingAccount,
  NotificationSettings,
  ChecklistItem,
} from "@/types/database";
import ProfileSettings from "@/components/ProfileSettings";
import TradingAccountsManager from "@/components/TradingAccountsManager";
import NotificationAndChecklistSettings from "@/components/NotificationAndChecklistSettings";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    { data: profile },
    { data: accounts },
    { data: notifSettings },
    { data: checklistItems },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user!.id).single(),
    supabase.from("trading_accounts").select("*").eq("user_id", user!.id),
    supabase.from("notification_settings").select("*").eq("user_id", user!.id).single(),
    supabase.from("checklist_items").select("*").eq("user_id", user!.id).order("order_index"),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8 md:py-8">
      <h1 className="mb-6 text-xl font-semibold">Paramètres</h1>

      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <h2 className="mb-4 text-sm font-medium">Profil & gestion du risque</h2>
        <ProfileSettings profile={profile as Profile} />
      </div>

      <div className="mb-6 rounded-xl border border-border bg-surface p-5">
        <TradingAccountsManager accounts={(accounts as TradingAccount[]) ?? []} />
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <NotificationAndChecklistSettings
          settings={notifSettings as NotificationSettings}
          checklistItems={(checklistItems as ChecklistItem[]) ?? []}
        />
      </div>
    </div>
  );
}
