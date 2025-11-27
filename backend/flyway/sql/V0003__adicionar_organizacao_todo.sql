-- =============================================
-- Migration V0003: Adicionar organizacao ao TODO
-- =============================================

-- Adicionar coluna de organizacao ao TODO
ALTER TABLE TODO ADD COLUMN TODO_ORG_ID INTEGER;

-- Adicionar coluna de criador ao TODO
ALTER TABLE TODO ADD COLUMN TODO_CRIADO_POR INTEGER;

-- Criar organizacao padrao para dados existentes
INSERT INTO ORGANIZATION (ORG_NOME, ORG_SLUG, ORG_ATIVA, ORG_DATA_CRIACAO)
VALUES ('Organizacao Padrao', 'default', 1, datetime('now'));

-- Atribuir todos existentes a organizacao padrao
UPDATE TODO SET TODO_ORG_ID = (SELECT ORG_ID FROM ORGANIZATION WHERE ORG_SLUG = 'default')
WHERE TODO_ORG_ID IS NULL;

-- Criar indices para consultas por organizacao
CREATE INDEX IDX_TODO_ORG ON TODO(TODO_ORG_ID);
CREATE INDEX IDX_TODO_ORG_CONCLUIDO ON TODO(TODO_ORG_ID, TODO_CONCLUIDO);
CREATE INDEX IDX_TODO_CRIADO_POR ON TODO(TODO_CRIADO_POR);
