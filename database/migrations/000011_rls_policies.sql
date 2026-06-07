-- Migration: 000011 — RLS e policies
-- ==========================================
-- RLS E POLICIES
-- ==========================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dice ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE species ENABLE ROW LEVEL SECURITY;
ALTER TABLE feats ENABLE ROW LEVEL SECURITY;
ALTER TABLE backgrounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_option_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_list_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subclasses ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE armors ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subclass_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_ability_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_skill_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_tool_proficiency_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE feat_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE species_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_option_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_spell_choice_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_option_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_feats ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_trait_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_trait_spell_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_spell_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_damage ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_damage_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_condition_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE effect_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapon_masteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapon_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
ALTER TABLE weapon_has_properties ENABLE ROW LEVEL SECURITY;

ALTER TABLE spellcasting_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_slot_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_spellcasting ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_saving_throws ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_weapon_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_armor_proficiencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_tool_proficiency_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_skill_choice_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_skill_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_equipment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_equipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_resource_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_resource_dice ENABLE ROW LEVEL SECURITY;
ALTER TABLE trait_resource_die_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_knowledge_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE spell_knowledge_by_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE subclass_spellcasting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read catalog" ON spellcasting_progressions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON spell_slot_progressions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_spellcasting FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_saving_throws FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_weapon_proficiencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_armor_proficiencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_tool_proficiency_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_skill_choice_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_skill_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON background_equipment_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON background_equipment_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_resources FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_resource_progressions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_resource_dice FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_resource_die_progressions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON spell_knowledge_progressions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON spell_knowledge_by_level FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON subclass_spellcasting FOR SELECT TO authenticated USING (true);


CREATE POLICY "Authenticated users can read catalog" ON roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON dice FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON damage_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON languages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON tools FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON species FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON feats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON backgrounds FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON traits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON spell_lists FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_option_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON spells FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON spell_list_spells FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON spell_rolls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON subclasses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON armors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON class_traits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON subclass_traits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON background_ability_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON background_skill_proficiencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON background_tool_proficiency_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON feat_traits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON species_traits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON item_traits FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_spells FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_option_spells FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_spell_choice_groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON trait_option_modifiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON effects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON effect_modifiers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON effect_damage FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON effect_damage_adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON effect_statuses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON effect_condition_adjustments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON effect_proficiencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON weapon_masteries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON weapon_properties FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON weapons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read catalog" ON weapon_has_properties FOR SELECT TO authenticated USING (true);

CREATE POLICY "Players can read own profile"
ON players FOR SELECT TO authenticated
USING (id = (SELECT auth.uid()));

CREATE POLICY "Players can update own profile"
ON players FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Campaign members can read campaigns"
ON campaigns FOR SELECT TO authenticated
USING (private.is_campaign_member(id));

CREATE POLICY "Players can create owned campaigns"
ON campaigns FOR INSERT TO authenticated
WITH CHECK (owner_player_id = (SELECT auth.uid()));

CREATE POLICY "Campaign owners can update campaigns"
ON campaigns FOR UPDATE TO authenticated
USING (private.is_campaign_owner(id))
WITH CHECK (owner_player_id = (SELECT auth.uid()));

CREATE POLICY "Campaign owners can delete campaigns"
ON campaigns FOR DELETE TO authenticated
USING (private.is_campaign_owner(id));

CREATE POLICY "Campaign members can read memberships"
ON player_campaigns FOR SELECT TO authenticated
USING (private.is_campaign_member(campaign_id) OR player_id = (SELECT auth.uid()));

CREATE POLICY "Campaign owners can add memberships"
ON player_campaigns FOR INSERT TO authenticated
WITH CHECK (private.is_campaign_owner(campaign_id));

CREATE POLICY "Campaign owners can update memberships"
ON player_campaigns FOR UPDATE TO authenticated
USING (private.is_campaign_owner(campaign_id))
WITH CHECK (private.is_campaign_owner(campaign_id));

CREATE POLICY "Campaign owners and members can remove memberships"
ON player_campaigns FOR DELETE TO authenticated
USING (private.is_campaign_owner(campaign_id) OR player_id = (SELECT auth.uid()));

CREATE POLICY "Accessible characters can be read"
ON characters FOR SELECT TO authenticated
USING (private.can_access_character(id));

CREATE POLICY "Players can create owned characters"
ON characters FOR INSERT TO authenticated
WITH CHECK (owner_player_id = (SELECT auth.uid()));

CREATE POLICY "Editable characters can be updated"
ON characters FOR UPDATE TO authenticated
USING (private.can_edit_character(id))
WITH CHECK (private.can_edit_character(id));

CREATE POLICY "Editable characters can be deleted"
ON characters FOR DELETE TO authenticated
USING (private.can_edit_character(id));

CREATE POLICY "Campaign members can read character links"
ON player_characters FOR SELECT TO authenticated
USING (private.is_campaign_member(campaign_id) OR private.can_access_character(character_id));

CREATE POLICY "Owners can link characters to campaigns"
ON player_characters FOR INSERT TO authenticated
WITH CHECK (
    private.is_campaign_owner(campaign_id)
    OR (
        player_id = (SELECT auth.uid())
        AND private.can_edit_character(character_id)
        AND private.is_campaign_member(campaign_id)
    )
);

CREATE POLICY "Editors can update character links"
ON player_characters FOR UPDATE TO authenticated
USING (private.is_campaign_owner(campaign_id) OR private.can_edit_character(character_id))
WITH CHECK (private.is_campaign_owner(campaign_id) OR private.can_edit_character(character_id));

CREATE POLICY "Editors can delete character links"
ON player_characters FOR DELETE TO authenticated
USING (private.is_campaign_owner(campaign_id) OR private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON inventory FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON inventory FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON inventory FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON inventory FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_classes FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_classes FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_classes FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_classes FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_skills FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_skills FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_skills FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_skills FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_proficiencies FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_proficiencies FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_proficiencies FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_proficiencies FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_feats FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_feats FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_feats FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_feats FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_trait_options FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_trait_options FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_trait_options FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_trait_options FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_trait_spell_choices FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_trait_spell_choices FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_trait_spell_choices FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_trait_spell_choices FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_spells FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_spells FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_spells FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_spells FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_spell_slots FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_spell_slots FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_spell_slots FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_spell_slots FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_resources FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_resources FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_resources FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_resources FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_conditions FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_conditions FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_conditions FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_conditions FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

CREATE POLICY "Accessible character rows can be read" ON character_effects FOR SELECT TO authenticated USING (private.can_access_character(character_id));
CREATE POLICY "Editable character rows can be inserted" ON character_effects FOR INSERT TO authenticated WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be updated" ON character_effects FOR UPDATE TO authenticated USING (private.can_edit_character(character_id)) WITH CHECK (private.can_edit_character(character_id));
CREATE POLICY "Editable character rows can be deleted" ON character_effects FOR DELETE TO authenticated USING (private.can_edit_character(character_id));

COMMENT ON TABLE traits IS
    'Habilidade nomeada (classe, espécie, item, feat). activation_scope: equipped | carried.';

COMMENT ON TABLE effects IS
    'Mecânica de uma trait ou opção. Filhas: effect_modifiers, effect_damage, effect_damage_adjustments, effect_statuses.';

COMMENT ON TABLE effect_modifiers IS
    'Bônus numérico ou advantage/disadvantage. affected_stat define o alvo na ficha (armor_class, all_saving_throws, …).';

COMMENT ON TABLE effect_damage IS
    'Rolagem de dano OU cura (effect_type=healing usa damage_type_id NULL).';

COMMENT ON TABLE effect_damage_adjustments IS
    'Resistência, imunidade ou vulnerabilidade a um tipo de dano. scope_text limita duração/condição.';

COMMENT ON TABLE items IS
    'Catálogo de itens. is_magical, requires_attunement, is_consumable alimentam inventário e RPCs.';

COMMENT ON TABLE inventory IS
    'Inventário do personagem. is_equipped + is_attuned determinam traits ativas (limite 3 attuned).';

COMMENT ON TABLE character_effects IS
    'Efeito temporário ativo no personagem (ex.: poção bebida). Alimenta v_character_active_effects.';

COMMENT ON TABLE trait_resources IS
    'Pool de usos por trait. resource_key item-* = cargas de item mágico; outros = Rage, Ki, etc.';

COMMENT ON VIEW v_character_traits IS
    'Traits ativas: classe/nível, item equipado ou portado (com attunement), feats, espécie.';

COMMENT ON VIEW v_character_active_effects IS
    'União de efeitos de traits ativas + character_effects. JSON via v_effect_details.';

COMMENT ON VIEW v_character_stat_modifiers IS
    'Modifiers ativos achatados para cálculo de CA/saves/ataque na ficha.';

COMMENT ON FUNCTION public.consume_inventory_item IS
    'Consome item is_consumable: insere character_effects e decrementa quantity.';

COMMENT ON FUNCTION public.set_inventory_equipped IS
    'Equipa/desequipa item. Desequipar limpa is_attuned (trigger).';

COMMENT ON FUNCTION public.set_inventory_attuned IS
    'Sintoniza item (máx. 3). Falha se item não exige attunement.';

COMMENT ON TABLE trait_spells IS
    'Magias concedidas por um trait. charge_cost = cargas gastas (itens com pool); NULL = sem custo.';

COMMENT ON COLUMN trait_spells.charge_cost IS
    'Cargas do pool do item gastas ao conjurar esta magia. NULL para feats, espécies e cast fixo.';

COMMENT ON COLUMN trait_spells.notes IS
    'Notas de custo ou recarga específicas desta magia no trait.';
