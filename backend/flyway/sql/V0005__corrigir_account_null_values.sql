-- =============================================
-- Migration V0005: Corrigir valores NULL na tabela ACCOUNT
-- =============================================

-- Atualizar registros existentes que tem valores NULL
UPDATE ACCOUNT SET ACC_SENHA_EXPIRADA = 0 WHERE ACC_SENHA_EXPIRADA IS NULL;
UPDATE ACCOUNT SET ACC_BLOQUEADO = 0 WHERE ACC_BLOQUEADO IS NULL;
UPDATE ACCOUNT SET ACC_TENTATIVAS_FALHA = 0 WHERE ACC_TENTATIVAS_FALHA IS NULL;
