-- Custom SQL migration file, put your code below! --
-- Function to update parent wishlist's updated_at timestamp
CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wishlists
  SET updated_at = NOW()
  WHERE id = COALESCE(NEW.wishlist_id, OLD.wishlist_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Single trigger for all operations
CREATE TRIGGER wishlist_items_change_trigger
AFTER INSERT OR UPDATE OR DELETE ON wishlist_items
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_updated_at();
