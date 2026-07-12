"use client";

import Link from "next/link";
import { MessageCircle, ArrowRight, TrendingUp } from "lucide-react";

const WHATSAPP_GROUP_URL = "https://chat.whatsapp.com/DUTkf3Gc2RTI4AQTzy1PCV?s=cl&p=i&mlu=0&ilr=0";

export default function WelcomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <TrendingUp className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-textPrimary">Bienvenue sur MyTradEdge</h1>
          <p className="text-sm text-textSecondary">
            Votre compte est prêt. Une dernière chose avant de commencer.
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5 text-left">
          <div className="mb-3 flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-medium text-textPrimary">Rappels de discipline</h2>
          </div>
          <p className="mb-4 text-sm text-textSecondary">
            Rejoignez notre groupe WhatsApp pour un rappel quotidien : brief du matin, debrief du
            soir, et un peu de discipline collective.
          </p>
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            <MessageCircle className="h-4 w-4" />
            Rejoindre le groupe WhatsApp
          </a>
        </div>

        <Link
          href="/dashboard"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm text-textSecondary transition hover:bg-surfaceHover hover:text-textPrimary"
        >
          Continuer vers mon tableau de bord
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
