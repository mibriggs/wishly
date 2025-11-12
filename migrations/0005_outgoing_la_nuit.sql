CREATE INDEX "shared_to_wishlist_id_index" ON "shared_wishlists" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "discord_id_index" ON "users" USING btree ("discord_id");--> statement-breakpoint
CREATE INDEX "github_id_index" ON "users" USING btree ("github_id");--> statement-breakpoint
CREATE INDEX "items_to_wishlist_id_index" ON "wishlist_items" USING btree ("wishlist_id");--> statement-breakpoint
CREATE INDEX "items_is_deleted_index" ON "wishlist_items" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "wishlist_to_user_id_index" ON "wishlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wishlist_is_deleted_index" ON "wishlists" USING btree ("is_deleted");--> statement-breakpoint
CREATE INDEX "wishlist_updated_at_index" ON "wishlists" USING btree ("updated_at");