CREATE TABLE "subscriptions" (
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"subscribed_to_id" uuid NOT NULL,
	CONSTRAINT "subscriptions_pk" PRIMARY KEY("subscriber_id","subscribed_to_id")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscriber_id_users_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_subscribed_to_id_users_id_fk" FOREIGN KEY ("subscribed_to_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;