-- =============================================
-- Migration V0007: Adicionar coluna de avatar para usuario
-- =============================================

ALTER TABLE USUARIO ADD COLUMN USR_AVATAR TEXT;
