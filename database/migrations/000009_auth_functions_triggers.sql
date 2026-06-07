-- Migration: 000009 — auth, funções private e triggers
-- ==========================================
-- SUPABASE AUTH, FUNCOES E TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.protect_player_identity()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.id = OLD.id;
    NEW.created_at = OLD.created_at;

    IF (SELECT auth.uid()) IS NOT NULL THEN
        NEW.email = OLD.email;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.protect_campaign_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.created_at = OLD.created_at;

    IF (SELECT auth.uid()) IS NOT NULL THEN
        NEW.owner_player_id = OLD.owner_player_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.protect_character_owner()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.created_at = OLD.created_at;

    IF (SELECT auth.uid()) IS NOT NULL THEN
        NEW.owner_player_id = OLD.owner_player_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.handle_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    base_username TEXT;
BEGIN
    base_username := COALESCE(
        NULLIF(NEW.raw_user_meta_data ->> 'username', ''),
        NULLIF(NEW.raw_user_meta_data ->> 'preferred_username', ''),
        NULLIF(split_part(COALESCE(NEW.email, ''), '@', 1), ''),
        'user'
    );
    base_username := lower(regexp_replace(base_username, '[^a-zA-Z0-9_]+', '_', 'g'));

    IF base_username = '' THEN
        base_username := 'user';
    END IF;

    INSERT INTO public.players (
        id,
        username,
        display_name,
        email,
        avatar_url
    )
    VALUES (
        NEW.id,
        left(base_username, 220) || '_' || substring(NEW.id::TEXT FROM 1 FOR 8),
        COALESCE(
            NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'name', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'user_name', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'username', '')
        ),
        NEW.email,
        COALESCE(
            NULLIF(NEW.raw_user_meta_data ->> 'avatar_url', ''),
            NULLIF(NEW.raw_user_meta_data ->> 'picture', '')
        )
    )
    ON CONFLICT (id) DO UPDATE SET
        display_name = COALESCE(EXCLUDED.display_name, public.players.display_name),
        email = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, public.players.avatar_url),
        updated_at = now();

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.handle_auth_user();

CREATE TRIGGER on_auth_user_updated
AFTER UPDATE OF email, raw_user_meta_data ON auth.users
FOR EACH ROW
EXECUTE FUNCTION private.handle_auth_user();

CREATE TRIGGER trg_players_protect_identity
BEFORE UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION private.protect_player_identity();

CREATE TRIGGER trg_players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW
EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER trg_campaigns_protect_owner
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION private.protect_campaign_owner();

CREATE TRIGGER trg_campaigns_updated_at
BEFORE UPDATE ON campaigns
FOR EACH ROW
EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER trg_characters_protect_owner
BEFORE UPDATE ON characters
FOR EACH ROW
EXECUTE FUNCTION private.protect_character_owner();

CREATE TRIGGER trg_characters_updated_at
BEFORE UPDATE ON characters
FOR EACH ROW
EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE FUNCTION private.is_campaign_owner(target_campaign_id INT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.campaigns c
        WHERE c.id = target_campaign_id
          AND c.owner_player_id = (SELECT auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION private.is_campaign_member(target_campaign_id INT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.campaigns c
        WHERE c.id = target_campaign_id
          AND c.owner_player_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1
        FROM public.player_campaigns pc
        WHERE pc.campaign_id = target_campaign_id
          AND pc.player_id = (SELECT auth.uid())
    );
$$;

CREATE OR REPLACE FUNCTION private.can_access_character(target_character_id INT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.characters ch
        WHERE ch.id = target_character_id
          AND ch.owner_player_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1
        FROM public.player_characters pc
        WHERE pc.character_id = target_character_id
          AND private.is_campaign_member(pc.campaign_id)
    );
$$;

CREATE OR REPLACE FUNCTION private.can_edit_character(target_character_id INT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.characters ch
        WHERE ch.id = target_character_id
          AND ch.owner_player_id = (SELECT auth.uid())
    )
    OR EXISTS (
        SELECT 1
        FROM public.player_characters pc
        JOIN public.campaigns c ON c.id = pc.campaign_id
        WHERE pc.character_id = target_character_id
          AND c.owner_player_id = (SELECT auth.uid())
    );
$$;
