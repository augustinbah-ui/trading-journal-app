import { MessageCircle } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/DUTkf3Gc2RTI4AQTzy1PCV?s=cl&p=i&mlu=0&ilr=0";

export default function WhatsAppCard() {
  return (
    <a
      href={WHATSAPP_GROUP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition hover:bg-surfaceHover"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <MessageCircle className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-textPrimary">Rappels de discipline WhatsApp</p>
        <p className="text-xs text-textSecondary">Rejoignez le groupe pour ne rien manquer</p>
      </div>
    </a>
  );
}
