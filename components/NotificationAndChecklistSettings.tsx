"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NotificationSettings, ChecklistItem } from "@/types/database";
import { Plus, Trash2 } from "lucide-react";

export default function NotificationAndChecklistSettings({
  settings,
  checklistItems,
}: {
  settings: NotificationSettings;
  checklistItems: ChecklistItem[];
}) {
  const supabase = createClient();
  const router = useRouter();

  const [journalReminder, setJournalReminder] = useState(settings.daily_journal_reminder);
  const [reminderTime, setReminderTime] = useState(settings.daily_journal_reminder_time);
  const [eveningReminder, setEveningReminder] = useState(settings.evening_debrief_reminder);
  const [lossStreakAlert, setLossStreakAlert] = useState(settings.loss_streak_alert);
  const [lossThreshold, setLossThreshold] = useState(String(settings.loss_streak_threshold));

  const [newItem, setNewItem] = useState("");

  async function saveNotifications() {
    await supabase
      .from("notification_settings")
      .update({
        daily_journal_reminder: journalReminder,
        daily_journal_reminder_time: reminderTime,
        evening_debrief_reminder: eveningReminder,
        loss_streak_alert: lossStreakAlert,
        loss_streak_threshold: parseInt(lossThreshold) || 3,
      })
      .eq("id", settings.id);
    router.refresh();
  }

  async function addChecklistItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("checklist_items").insert({
      user_id: user.id,
      label: newItem,
      order_index: checklistItems.length,
    });
    setNewItem("");
    router.refresh();
  }

  async function deleteChecklistItem(id: string) {
    await supabase.from("checklist_items").delete().eq("id", id);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Notifications */}
      <div>
        <h2 className="mb-4 text-sm font-medium">Notifications</h2>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between text-sm">
            <span>Rappel quotidien de remplir le journal</span>
            <input
              type="checkbox"
              checked={journalReminder}
              onChange={(e) => setJournalReminder(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
          </label>

          {journalReminder && (
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-32 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
          )}

          <label className="flex items-center justify-between text-sm">
            <span>Rappel du debrief du soir</span>
            <input
              type="checkbox"
              checked={eveningReminder}
              onChange={(e) => setEveningReminder(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
          </label>

          <label className="flex items-center justify-between text-sm">
            <span>Alerte série de pertes</span>
            <input
              type="checkbox"
              checked={lossStreakAlert}
              onChange={(e) => setLossStreakAlert(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
          </label>

          {lossStreakAlert && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-textSecondary">Seuil :</span>
              <input
                type="number"
                value={lossThreshold}
                onChange={(e) => setLossThreshold(e.target.value)}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              />
              <span className="text-textSecondary">pertes consécutives</span>
            </div>
          )}

          <button
            onClick={saveNotifications}
            className="mt-1 self-start rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Enregistrer
          </button>
        </div>
      </div>

      {/* Checklist pré-trade */}
      <div>
        <h2 className="mb-4 text-sm font-medium">Checklist pré-trade personnalisée</h2>
        <form onSubmit={addChecklistItem} className="mb-3 flex gap-2">
          <input
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Ex: Vérifier le calendrier économique"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm text-white hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>

        <div className="space-y-2">
          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              {item.label}
              <button
                onClick={() => deleteChecklistItem(item.id)}
                className="text-textSecondary hover:text-loss"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
