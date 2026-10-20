-- Action#03 / Action#08 — admin validation of a customer / service-provider registration.
--
-- The spec fills CUSTOMER:Validated_By and Date_Validated (and SUPPLYER's equivalents) when
-- the administrator approves the registration. Both entities are `companies` here.
--
-- Additive and nullable: companies approved before this have neither, and the app keeps
-- approving (setting `active`) even if this has not been applied yet — acceptUserPending
-- writes these two in a separate, best-effort update.

alter table public.companies
  add column if not exists validated_by uuid references public.profiles (id) on delete set null,
  add column if not exists date_validated timestamptz;
