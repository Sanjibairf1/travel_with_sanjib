-- Support ten published questions per day while keeping the existing difficulty field.
alter table public.quiz_questions drop constraint if exists quiz_questions_difficulty_check;
alter table public.quiz_questions
  add constraint quiz_questions_difficulty_check
  check (difficulty ~ '^(easy|medium|hard)(-[0-9]{2})?$');

update public.app_settings
set value = jsonb_set(value, '{questions_per_day}', '10'::jsonb, true)
where key = 'quiz';

create or replace function public.claim_daily_quiz_score(p_score integer, p_quiz_date date)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_timezone text := 'Asia/Kolkata';
  v_today date;
  v_inserted integer;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select coalesce(value->>'timezone','Asia/Kolkata') into v_timezone from public.app_settings where key='publishing';
  v_today := (now() at time zone v_timezone)::date;
  if p_quiz_date <> v_today then raise exception 'Only today''s quiz can be claimed'; end if;
  if p_score < -50 or p_score > 100 then raise exception 'Invalid score'; end if;
  perform public.ensure_current_profile();
  insert into public.quiz_daily_sessions(user_id,quiz_date,first_score)
  values(v_user,p_quiz_date,p_score)
  on conflict (user_id,quiz_date) do nothing;
  get diagnostics v_inserted = row_count;
  return v_inserted = 1;
end;
$$;
