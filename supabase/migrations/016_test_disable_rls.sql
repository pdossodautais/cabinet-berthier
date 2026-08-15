-- TEST — disable RLS on contacts pour confirmer que c'est bien RLS
-- qui bloque et non une autre contrainte. On ré-enable dans 017.
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;
