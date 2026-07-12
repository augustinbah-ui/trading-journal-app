-- ============================================================
-- SCHEMA COMPLET - Trading Journal App
-- Modules couverts : Profil, Journal, Stats, Calculateur,
-- Plan de trading, Rituels, Comportemental, Notifications, Paramètres
-- ============================================================

-- ---------- 1. PROFIL UTILISATEUR ----------
-- Complète auth.users (géré nativement par Supabase Auth)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  starting_capital numeric(14,2) default 0,
  current_capital numeric(14,2) default 0,
  currency text default 'EUR',
  trading_style text check (trading_style in ('day', 'swing', 'both')) default 'both',
  markets text[] default '{}',            -- ex: {'forex','crypto','actions'}
  max_risk_per_trade_pct numeric(5,2) default 1.0,   -- % du capital max par trade
  max_daily_loss_pct numeric(5,2) default 3.0,       -- % de perte max journalière
  dark_mode boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- 2. COMPTES DE TRADING (multi-comptes) ----------
create table public.trading_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,                      -- ex: "Compte principal", "Compte prop firm"
  broker text,
  starting_balance numeric(14,2) default 0,
  currency text default 'EUR',
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- 3. STRATEGIES / SETUPS ----------
create table public.strategies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  entry_criteria text,
  exit_criteria text,
  example_image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ---------- 4. JOURNAL DE TRADING (module central) ----------
create table public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  account_id uuid references public.trading_accounts(id) on delete set null,
  strategy_id uuid references public.strategies(id) on delete set null,

  symbol text not null,                    -- ex: EURUSD, BTCUSD, AAPL
  direction text check (direction in ('long', 'short')) not null,

  entry_price numeric(18,6) not null,
  exit_price numeric(18,6),
  stop_loss numeric(18,6),
  take_profit numeric(18,6),
  position_size numeric(18,6) not null,

  entry_time timestamptz not null,
  exit_time timestamptz,

  result_amount numeric(14,2),             -- profit/perte en devise
  result_pct numeric(8,4),                 -- profit/perte en %
  status text check (status in ('open', 'closed', 'cancelled')) default 'open',

  screenshot_url text,
  notes text,

  emotion_before text,                     -- ex: 'confiant','stressé','neutre'
  emotion_after text,
  followed_plan boolean,                   -- respect du plan de trading

  tags text[] default '{}',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index trades_user_id_idx on public.trades(user_id);
create index trades_entry_time_idx on public.trades(entry_time desc);
create index trades_symbol_idx on public.trades(symbol);

-- ---------- 5. PLAN DE TRADING ----------
create table public.trading_plan (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  objectives text,
  rules text,
  risk_management_rules text,
  updated_at timestamptz default now()
);

-- ---------- 6. CHECKLIST PRE-TRADE (personnalisable) ----------
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  order_index int default 0,
  created_at timestamptz default now()
);

-- Suivi de la checklist cochée pour un trade donné
create table public.trade_checklist_results (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid references public.trades(id) on delete cascade not null,
  checklist_item_id uuid references public.checklist_items(id) on delete cascade not null,
  checked boolean default false
);

-- ---------- 7. RITUELS QUOTIDIENS (brief matin / debrief soir) ----------
create table public.daily_rituals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  ritual_date date not null,

  -- Matin
  morning_checklist_done boolean default false,
  morning_notes text,

  -- Soir / debrief
  evening_done boolean default false,
  what_worked text,
  what_didnt_work text,
  plan_respected boolean,
  evening_notes text,

  created_at timestamptz default now(),
  unique (user_id, ritual_date)
);

-- ---------- 8. LOG EMOTIONNEL / COMPORTEMENTAL ----------
create table public.emotion_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  trade_id uuid references public.trades(id) on delete cascade,
  logged_at timestamptz default now(),
  moment text check (moment in ('before', 'after')) not null,
  emotion text not null,                   -- ex: 'confiant','stressé','frustré','calme'
  intensity int check (intensity between 1 and 5),
  note text
);

-- Patterns comportementaux déclarés (sur-trading, revenge trading, etc.)
create table public.behavior_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  trade_id uuid references public.trades(id) on delete cascade,
  flag_type text check (flag_type in ('overtrading','revenge_trading','fomo','no_stop_loss','plan_ignored','other')) not null,
  note text,
  created_at timestamptz default now()
);

-- ---------- 9. NOTIFICATIONS (préférences, pas d'envoi temps réel marché) ----------
create table public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  daily_journal_reminder boolean default true,
  daily_journal_reminder_time time default '20:00',
  evening_debrief_reminder boolean default true,
  loss_streak_alert boolean default true,
  loss_streak_threshold int default 3
);

-- ---------- 10. CALCULATEUR DE RISQUE (historique des calculs, optionnel) ----------
create table public.risk_calculations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  capital numeric(14,2) not null,
  risk_pct numeric(5,2) not null,
  entry_price numeric(18,6) not null,
  stop_loss numeric(18,6) not null,
  take_profit numeric(18,6),
  calculated_position_size numeric(18,6),
  risk_reward_ratio numeric(8,2),
  created_at timestamptz default now()
);

-- ============================================================
-- ROW LEVEL SECURITY : chaque utilisateur ne voit que ses données
-- ============================================================

alter table public.profiles enable row level security;
alter table public.trading_accounts enable row level security;
alter table public.strategies enable row level security;
alter table public.trades enable row level security;
alter table public.trading_plan enable row level security;
alter table public.checklist_items enable row level security;
alter table public.trade_checklist_results enable row level security;
alter table public.daily_rituals enable row level security;
alter table public.emotion_logs enable row level security;
alter table public.behavior_flags enable row level security;
alter table public.notification_settings enable row level security;
alter table public.risk_calculations enable row level security;

-- Profiles : l'utilisateur ne voit/modifie que sa propre ligne
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Pattern identique pour toutes les tables liées à user_id
create policy "trading_accounts_all_own" on public.trading_accounts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "strategies_all_own" on public.strategies for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trades_all_own" on public.trades for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "trading_plan_all_own" on public.trading_plan for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "checklist_items_all_own" on public.checklist_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_rituals_all_own" on public.daily_rituals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "emotion_logs_all_own" on public.emotion_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "behavior_flags_all_own" on public.behavior_flags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "notification_settings_all_own" on public.notification_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "risk_calculations_all_own" on public.risk_calculations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trade_checklist_results : accès via le trade parent
create policy "trade_checklist_results_all_own" on public.trade_checklist_results for all
  using (exists (select 1 from public.trades t where t.id = trade_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.trades t where t.id = trade_id and t.user_id = auth.uid()));

-- ============================================================
-- TRIGGER : création automatique du profil à l'inscription
-- ============================================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.notification_settings (user_id) values (new.id);
  insert into public.trading_plan (user_id) values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
