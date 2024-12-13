CREATE TABLE IF NOT EXISTS "users_lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"status" integer DEFAULT 0,
	"user_id" integer NOT NULL,
	"free_lesson_id" integer,
	"paid_lesson_id" integer
);
--> statement-breakpoint
ALTER TABLE "review" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_lessons" ADD CONSTRAINT "users_lessons_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_lessons" ADD CONSTRAINT "users_lessons_free_lesson_id_free_lesson_id_fk" FOREIGN KEY ("free_lesson_id") REFERENCES "public"."free_lesson"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users_lessons" ADD CONSTRAINT "users_lessons_paid_lesson_id_paid_lesson_id_fk" FOREIGN KEY ("paid_lesson_id") REFERENCES "public"."paid_lesson"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review" ADD CONSTRAINT "review_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "review" ADD CONSTRAINT "review_paid_course_id_paid_course_id_fk" FOREIGN KEY ("paid_course_id") REFERENCES "public"."paid_course"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
