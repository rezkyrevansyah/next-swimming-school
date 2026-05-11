-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  branch_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT activity_logs_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);
CREATE TABLE public.attendance_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  class_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  session_date date NOT NULL,
  status USER-DEFINED NOT NULL,
  recorded_by_coach_id uuid,
  scanned_at timestamp with time zone,
  scan_method USER-DEFINED NOT NULL DEFAULT 'manual'::scan_method,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT attendance_records_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_records_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id),
  CONSTRAINT attendance_records_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT attendance_records_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  CONSTRAINT attendance_records_recorded_by_coach_id_fkey FOREIGN KEY (recorded_by_coach_id) REFERENCES public.coaches(id)
);
CREATE TABLE public.branches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  address text,
  location_lat numeric,
  location_lng numeric,
  contact_phone text,
  contact_email text,
  manager_id uuid,
  is_default boolean NOT NULL DEFAULT false,
  status USER-DEFINED NOT NULL DEFAULT 'active'::branch_status,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT branches_pkey PRIMARY KEY (id),
  CONSTRAINT fk_branches_manager FOREIGN KEY (manager_id) REFERENCES auth.users(id)
);
CREATE TABLE public.class_coaches (
  class_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT class_coaches_pkey PRIMARY KEY (class_id, coach_id),
  CONSTRAINT class_coaches_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_coaches_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id)
);
CREATE TABLE public.class_members (
  class_id uuid NOT NULL,
  member_id uuid NOT NULL,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'enrolled'::text CHECK (status = ANY (ARRAY['enrolled'::text, 'completed'::text, 'withdrawn'::text])),
  CONSTRAINT class_members_pkey PRIMARY KEY (class_id, member_id),
  CONSTRAINT class_members_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT class_members_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);
CREATE TABLE public.class_schedules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  CONSTRAINT class_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT class_schedules_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  age_range_min integer,
  age_range_max integer,
  monthly_price numeric NOT NULL DEFAULT 0 CHECK (monthly_price >= 0::numeric),
  sessions_per_month integer NOT NULL DEFAULT 4 CHECK (sessions_per_month > 0),
  capacity integer NOT NULL DEFAULT 10 CHECK (capacity > 0),
  location_lat numeric,
  location_lng numeric,
  location_name text,
  status USER-DEFINED NOT NULL DEFAULT 'active'::class_status,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);
CREATE TABLE public.coach_branches (
  coach_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coach_branches_pkey PRIMARY KEY (coach_id, branch_id),
  CONSTRAINT coach_branches_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id),
  CONSTRAINT coach_branches_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);
CREATE TABLE public.coach_certificates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  name text NOT NULL,
  photo_url text,
  issued_year integer CHECK (issued_year IS NULL OR issued_year >= 1970 AND issued_year <= (EXTRACT(year FROM now())::integer + 1)),
  valid_until date,
  no_expiry boolean NOT NULL DEFAULT false,
  approval_status USER-DEFINED NOT NULL DEFAULT 'pending_approval'::certificate_status,
  approved_by uuid,
  approved_at timestamp with time zone,
  approval_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coach_certificates_pkey PRIMARY KEY (id),
  CONSTRAINT coach_certificates_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id),
  CONSTRAINT coach_certificates_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id)
);
CREATE TABLE public.coach_clock_records (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL,
  branch_id uuid NOT NULL,
  clock_in_at timestamp with time zone NOT NULL DEFAULT now(),
  clock_in_date date NOT NULL DEFAULT CURRENT_DATE,
  clock_in_selfie_url text,
  clock_in_lat numeric,
  clock_in_lng numeric,
  clock_in_distance_m numeric CHECK (clock_in_distance_m IS NULL OR clock_in_distance_m >= 0::numeric),
  clock_in_accuracy numeric,
  ip_address inet,
  user_agent text,
  suspicious_flag boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coach_clock_records_pkey PRIMARY KEY (id),
  CONSTRAINT coach_clock_records_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id),
  CONSTRAINT coach_clock_records_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);
CREATE TABLE public.coach_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  nickname text,
  dob date,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
  photo_url text,
  phone text,
  specializations ARRAY DEFAULT '{}'::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coach_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT coach_profiles_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id)
);
CREATE TABLE public.coaches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  coach_id_code text NOT NULL UNIQUE,
  status USER-DEFINED NOT NULL DEFAULT 'active'::coach_status,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT coaches_pkey PRIMARY KEY (id),
  CONSTRAINT coaches_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.member_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  nickname text,
  dob date NOT NULL,
  gender text CHECK (gender = ANY (ARRAY['male'::text, 'female'::text])),
  photo_url text,
  phone text,
  phone_owner USER-DEFINED NOT NULL DEFAULT 'self'::phone_owner,
  parent_name text,
  parent_phone text,
  address text,
  health_history text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT member_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT member_profiles_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);
CREATE TABLE public.member_qr_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT member_qr_tokens_pkey PRIMARY KEY (id),
  CONSTRAINT member_qr_tokens_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id)
);
CREATE TABLE public.members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  branch_id uuid NOT NULL,
  member_id_code text NOT NULL,
  type USER-DEFINED NOT NULL DEFAULT 'regular'::member_type,
  school_id uuid,
  payment_handling USER-DEFINED NOT NULL DEFAULT 'individual'::payment_handling,
  has_account boolean NOT NULL DEFAULT true,
  status USER-DEFINED NOT NULL DEFAULT 'pending_payment'::member_status,
  joined_date date NOT NULL DEFAULT CURRENT_DATE,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT members_pkey PRIMARY KEY (id),
  CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT members_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  CONSTRAINT members_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  resource text NOT NULL,
  action text NOT NULL,
  description text,
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.report_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  semester_id uuid NOT NULL,
  member_id uuid NOT NULL,
  class_id uuid NOT NULL,
  coach_id uuid NOT NULL,
  sessions_total integer NOT NULL DEFAULT 0,
  sessions_present integer NOT NULL DEFAULT 0,
  sessions_late integer NOT NULL DEFAULT 0,
  sessions_permitted integer NOT NULL DEFAULT 0,
  sessions_sick integer NOT NULL DEFAULT 0,
  sessions_absent integer NOT NULL DEFAULT 0,
  attendance_rate numeric DEFAULT 
CASE
    WHEN (sessions_total > 0) THEN round(((((sessions_present + sessions_late))::numeric / (sessions_total)::numeric) * (100)::numeric), 2)
    ELSE (0)::numeric
END,
  skill_scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  coach_notes text,
  goals_achieved text,
  next_goals text,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::report_card_status,
  published_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT report_cards_pkey PRIMARY KEY (id),
  CONSTRAINT report_cards_semester_id_fkey FOREIGN KEY (semester_id) REFERENCES public.semesters(id),
  CONSTRAINT report_cards_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id),
  CONSTRAINT report_cards_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT report_cards_coach_id_fkey FOREIGN KEY (coach_id) REFERENCES public.coaches(id)
);
CREATE TABLE public.role_permissions (
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  level integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.schools (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL,
  name text NOT NULL,
  contact_person text,
  contact_phone text,
  address text,
  school_user_id uuid,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id),
  CONSTRAINT schools_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id),
  CONSTRAINT schools_school_user_id_fkey FOREIGN KEY (school_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.semesters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  branch_id uuid NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  input_deadline date NOT NULL,
  status USER-DEFINED NOT NULL DEFAULT 'draft'::semester_status,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT semesters_pkey PRIMARY KEY (id),
  CONSTRAINT semesters_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);
CREATE TABLE public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  branch_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT user_roles_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id)
);