-- Migration 033: Add category column to products catalog

ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(account_id, category);
