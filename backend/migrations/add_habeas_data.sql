-- Migración: Habeas Data
-- Ejecutar en Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS habeas_data_accepted_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN profiles.habeas_data_accepted_at IS
  'Fecha en que el usuario aceptó el tratamiento de datos (Habeas Data - Ley 1581 de 2012). NULL = no ha aceptado aún.';
