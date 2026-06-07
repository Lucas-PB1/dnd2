-- create_character faz INSERT em várias tabelas com RLS.
-- SECURITY INVOKER falha quando o JWT não propaga role authenticated ao PostgREST.
-- DEFINER mantém auth.uid() do chamador e contorna RLS nas escritas internas.

ALTER FUNCTION public.create_character(JSONB) SECURITY DEFINER;

COMMENT ON FUNCTION public.create_character IS
    'Cria personagem (SECURITY DEFINER): classes, proficiências, escolhas, inventário; sync slots/cargas.';
