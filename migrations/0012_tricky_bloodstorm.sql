CREATE INDEX "session_user_id_deleted_at_index" ON "sessions" USING btree ("user_id","deleted_at");--> statement-breakpoint
CREATE INDEX "shared_wishlist_expires_index" ON "shared_wishlists" USING btree ("wishlist_id","expires_at");--> statement-breakpoint
CREATE INDEX "items_wishlist_deleted_index" ON "wishlist_items" USING btree ("wishlist_id","is_deleted");--> statement-breakpoint
CREATE INDEX "items_id_wishlist_index" ON "wishlist_items" USING btree ("id","wishlist_id");--> statement-breakpoint
CREATE INDEX "wishlist_user_deleted_updated_index" ON "wishlists" USING btree ("user_id","is_deleted","updated_at");