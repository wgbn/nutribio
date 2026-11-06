CREATE SCHEMA "app";
--> statement-breakpoint
CREATE TABLE "app"."bio_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"weight_kg" real,
	"body_fat_pct" real,
	"water_pct" real,
	"bmr_kcal" real,
	"visceral_fat" real,
	"bmi" real,
	"muscle_kg" real,
	"protein_pct" real,
	"bone_mass_kg" real,
	"body_age" real,
	"ideal_weight_kg" real,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bio_records_weight_check" CHECK ("app"."bio_records"."weight_kg" is null or "app"."bio_records"."weight_kg" between 30 and 400),
	CONSTRAINT "bio_records_body_fat_check" CHECK ("app"."bio_records"."body_fat_pct" is null or "app"."bio_records"."body_fat_pct" between 1 and 75),
	CONSTRAINT "bio_records_water_check" CHECK ("app"."bio_records"."water_pct" is null or "app"."bio_records"."water_pct" between 20 and 80)
);
--> statement-breakpoint
ALTER TABLE "app"."bio_records" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."consents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"document" text NOT NULL,
	"version" text NOT NULL,
	"locale" text NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"withdrawn_at" timestamp with time zone,
	CONSTRAINT "consents_document_check" CHECK ("app"."consents"."document" in ('terms_privacy', 'health_data', 'age_18')),
	CONSTRAINT "consents_locale_check" CHECK ("app"."consents"."locale" in ('pt-PT', 'pt-BR', 'en-GB', 'es', 'fr', 'de', 'it'))
);
--> statement-breakpoint
ALTER TABLE "app"."consents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."profile_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app"."profile_history" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"sex" text NOT NULL,
	"age" integer NOT NULL,
	"height_cm" real NOT NULL,
	"initial_weight_kg" real NOT NULL,
	"goal" text NOT NULL,
	"country" text NOT NULL,
	"exercise" jsonb NOT NULL,
	"supplements" jsonb NOT NULL,
	"excluded_foods" text DEFAULT '' NOT NULL,
	"observations" text DEFAULT '' NOT NULL,
	"locale" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_sex_check" CHECK ("app"."profiles"."sex" in ('male', 'female')),
	CONSTRAINT "profiles_goal_check" CHECK ("app"."profiles"."goal" in ('maintain', 'lose_fat', 'lose_weight', 'gain_mass')),
	CONSTRAINT "profiles_country_check" CHECK ("app"."profiles"."country" in ('PT', 'BR', 'ES', 'FR', 'DE', 'IT', 'NL', 'BE', 'IE', 'AT', 'LU', 'GB')),
	CONSTRAINT "profiles_locale_check" CHECK ("app"."profiles"."locale" in ('pt-PT', 'pt-BR', 'en-GB', 'es', 'fr', 'de', 'it')),
	CONSTRAINT "profiles_age_check" CHECK ("app"."profiles"."age" between 18 and 120),
	CONSTRAINT "profiles_height_check" CHECK ("app"."profiles"."height_cm" between 100 and 250),
	CONSTRAINT "profiles_weight_check" CHECK ("app"."profiles"."initial_weight_kg" between 30 and 400),
	CONSTRAINT "profiles_excluded_foods_length_check" CHECK (char_length("app"."profiles"."excluded_foods") <= 1000),
	CONSTRAINT "profiles_observations_length_check" CHECK (char_length("app"."profiles"."observations") <= 2000)
);
--> statement-breakpoint
ALTER TABLE "app"."profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."dishes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"day" text NOT NULL,
	"slot" text NOT NULL,
	"variation_index" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"ingredients" jsonb NOT NULL,
	"macros" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "dishes_day_check" CHECK ("app"."dishes"."day" in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
	CONSTRAINT "dishes_slot_check" CHECK ("app"."dishes"."slot" in ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner')),
	CONSTRAINT "dishes_variation_index_check" CHECK ("app"."dishes"."variation_index" between 0 and 3)
);
--> statement-breakpoint
ALTER TABLE "app"."dishes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."plan_selections" (
	"plan_id" uuid NOT NULL,
	"day" text NOT NULL,
	"slot" text NOT NULL,
	"selected_index" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plan_selections_plan_id_day_slot_pk" PRIMARY KEY("plan_id","day","slot"),
	CONSTRAINT "plan_selections_day_check" CHECK ("app"."plan_selections"."day" in ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')),
	CONSTRAINT "plan_selections_slot_check" CHECK ("app"."plan_selections"."slot" in ('breakfast', 'morning_snack', 'lunch', 'afternoon_snack', 'dinner')),
	CONSTRAINT "plan_selections_index_check" CHECK ("app"."plan_selections"."selected_index" between 0 and 3)
);
--> statement-breakpoint
ALTER TABLE "app"."plan_selections" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."plan_shopping_items" (
	"plan_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"unit_weight_grams" real,
	"package_grams" real,
	"package_label" text,
	CONSTRAINT "plan_shopping_items_plan_id_key_pk" PRIMARY KEY("plan_id","key"),
	CONSTRAINT "plan_shopping_items_category_check" CHECK ("app"."plan_shopping_items"."category" in ('produce', 'meat_fish', 'dairy_eggs', 'bakery_grains', 'pantry', 'frozen', 'drinks', 'other'))
);
--> statement-breakpoint
ALTER TABLE "app"."plan_shopping_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"inputs_hash" text NOT NULL,
	"locale" text NOT NULL,
	"country" text NOT NULL,
	"model" text NOT NULL,
	"targets" jsonb NOT NULL,
	"profile_snapshot" jsonb NOT NULL,
	"biometrics_snapshot" jsonb,
	"overview" text,
	"error_code" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL,
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"heartbeat_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "plans_status_check" CHECK ("app"."plans"."status" in ('queued', 'running', 'succeeded', 'failed')),
	CONSTRAINT "plans_locale_check" CHECK ("app"."plans"."locale" in ('pt-PT', 'pt-BR', 'en-GB', 'es', 'fr', 'de', 'it')),
	CONSTRAINT "plans_country_check" CHECK ("app"."plans"."country" in ('PT', 'BR', 'ES', 'FR', 'DE', 'IT', 'NL', 'BE', 'IE', 'AT', 'LU', 'GB')),
	CONSTRAINT "plans_error_code_check" CHECK ("app"."plans"."error_code" is null or "app"."plans"."error_code" in ('emptyResponse', 'unparseable', 'badResponse', 'emptyPlan', 'apiError', 'timeout', 'unknown')),
	CONSTRAINT "plans_attempts_check" CHECK ("app"."plans"."attempts" >= 0)
);
--> statement-breakpoint
ALTER TABLE "app"."plans" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "app"."shopping_checks" (
	"plan_id" uuid NOT NULL,
	"key" text NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "shopping_checks_plan_id_key_pk" PRIMARY KEY("plan_id","key")
);
--> statement-breakpoint
ALTER TABLE "app"."shopping_checks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "app"."dishes" ADD CONSTRAINT "dishes_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "app"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."plan_selections" ADD CONSTRAINT "plan_selections_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "app"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."plan_shopping_items" ADD CONSTRAINT "plan_shopping_items_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "app"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app"."shopping_checks" ADD CONSTRAINT "shopping_checks_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "app"."plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "bio_records_user_date_uq" ON "app"."bio_records" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "consents_user_document_idx" ON "app"."consents" USING btree ("user_id","document","granted_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "profile_history_user_created_idx" ON "app"."profile_history" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "dishes_plan_slot_variation_uq" ON "app"."dishes" USING btree ("plan_id","day","slot","variation_index");--> statement-breakpoint
CREATE INDEX "plans_user_queued_idx" ON "app"."plans" USING btree ("user_id","queued_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "plans_status_queued_idx" ON "app"."plans" USING btree ("status","queued_at");--> statement-breakpoint
CREATE UNIQUE INDEX "plans_one_current_uq" ON "app"."plans" USING btree ("user_id") WHERE "app"."plans"."is_current";--> statement-breakpoint
CREATE UNIQUE INDEX "plans_one_active_job_uq" ON "app"."plans" USING btree ("user_id") WHERE "app"."plans"."status" in ('queued', 'running');