package br.com.virtualmimic.api.dto.response.character;

import br.com.virtualmimic.api.models.character.CharacterEquipment;
import br.com.virtualmimic.api.models.character.CharacterFeat;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.models.character.CharacterSpell;
import br.com.virtualmimic.api.util.ProficiencyBonusCalculator;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CharacterResponseDto {

    private Long characterId;
    private UUID ownerId;

    private String characterName;
    private String characterLastName;
    private String playerName;
    private Integer characterAge;

    private String characterHistory;
    private String characterAppearance;
    private String personalityTraits;
    private String ideals;
    private String bonds;
    private String flaws;
    private String goals;
    private String alignment;

    private Integer strength;
    private Integer dexterity;
    private Integer constitution;
    private Integer intelligence;
    private Integer wisdom;
    private Integer charisma;

    private Integer currentLevel;
    private Integer maxHealth;
    private Integer currentHealth;
    private Integer proficiencyBonus;

    private Integer hitDie;
    private Integer speed;
    private Integer armorClass;

    private String raceSlug;
    private String raceName;
    private String classSlug;
    private String className;
    private String backgroundSlug;
    private String backgroundName;

    private List<String> skillProficiencies;
    private List<String> savingThrowProficiencies;

    private List<EquipmentDto> inventory;
    private List<SpellDto> spells;
    private List<FeatDto> feats;
    private Integer goldPieces;

    public static CharacterResponseDto fromEntity(CharacterModel c) {
        CharacterResponseDto dto = new CharacterResponseDto();
        dto.setCharacterId(c.getCharacterId());
        dto.setOwnerId(c.getOwner().getUserId());

        dto.setCharacterName(c.getCharacterName());
        dto.setCharacterLastName(c.getCharacterLastName());
        dto.setPlayerName(c.getPlayerName());
        dto.setCharacterAge(c.getCharacterAge());
        dto.setCharacterHistory(c.getCharacterHistory());
        dto.setCharacterAppearance(c.getCharacterAppearance());
        dto.setPersonalityTraits(c.getPersonalityTraits());
        dto.setIdeals(c.getIdeals());
        dto.setBonds(c.getBonds());
        dto.setFlaws(c.getFlaws());
        dto.setGoals(c.getGoals());
        dto.setAlignment(c.getAlignment());

        dto.setStrength(c.getStrength());
        dto.setDexterity(c.getDexterity());
        dto.setConstitution(c.getConstitution());
        dto.setIntelligence(c.getIntelligence());
        dto.setWisdom(c.getWisdom());
        dto.setCharisma(c.getCharisma());

        dto.setCurrentLevel(c.getCurrentLevel());
        dto.setMaxHealth(c.getMaxHealth());
        dto.setCurrentHealth(c.getCurrentHealth());
        int level = c.getCurrentLevel() != null ? c.getCurrentLevel() : 1;
        dto.setProficiencyBonus(ProficiencyBonusCalculator.forLevel(level));

        dto.setHitDie(c.getHitDie());
        dto.setSpeed(c.getSpeed());
        dto.setArmorClass(c.getArmorClass());

        dto.setRaceSlug(c.getRaceSlug());
        dto.setRaceName(c.getRaceName());
        dto.setClassSlug(c.getClassSlug());
        dto.setClassName(c.getClassName());
        dto.setBackgroundSlug(c.getBackgroundSlug());
        dto.setBackgroundName(c.getBackgroundName());

        dto.setSkillProficiencies(c.getSkillProficiencies());
        dto.setSavingThrowProficiencies(c.getSavingThrowProficiencies());

        if (c.getInventory() != null) {
            dto.setInventory(c.getInventory().stream().map(EquipmentDto::fromEntity).toList());
        }
        if (c.getSpells() != null) {
            dto.setSpells(c.getSpells().stream().map(SpellDto::fromEntity).toList());
        }
        if (c.getFeats() != null) {
            dto.setFeats(c.getFeats().stream().map(FeatDto::fromEntity).toList());
        }
        dto.setGoldPieces(c.getGoldPieces());
        return dto;
    }

    @Data
    public static class EquipmentDto {
        private Long id;
        private String slug;
        private String name;
        private String description;
        private Double weight;
        private Integer quantity;
        private String damageDice;
        private Integer armorClassBonus;
        private String armorCategory;
        private String type;

        public static EquipmentDto fromEntity(CharacterEquipment e) {
            EquipmentDto dto = new EquipmentDto();
            dto.setId(e.getId());
            dto.setSlug(e.getSlug());
            dto.setName(e.getName());
            dto.setDescription(e.getDescription());
            dto.setWeight(e.getWeight());
            dto.setQuantity(e.getQuantity());
            dto.setDamageDice(e.getDamageDice());
            dto.setArmorClassBonus(e.getArmorClassBonus());
            dto.setArmorCategory(e.getArmorCategory());
            dto.setType(e.getType() != null ? e.getType().name() : null);
            return dto;
        }
    }

    @Data
    public static class FeatDto {
        private Long id;
        private String name;
        private String category;
        private String actionType;
        private String cost;
        private String description;

        public static FeatDto fromEntity(CharacterFeat f) {
            FeatDto dto = new FeatDto();
            dto.setId(f.getId());
            dto.setName(f.getName());
            dto.setCategory(f.getCategory());
            dto.setActionType(f.getActionType());
            dto.setCost(f.getCost());
            dto.setDescription(f.getDescription());
            return dto;
        }
    }

    @Data
    public static class SpellDto {
        private Long id;
        private String slug;
        private String name;
        private Integer level;
        private String school;
        private String castingTime;
        private String range;
        private String components;
        private String duration;
        private String description;

        public static SpellDto fromEntity(CharacterSpell s) {
            SpellDto dto = new SpellDto();
            dto.setId(s.getId());
            dto.setSlug(s.getSlug());
            dto.setName(s.getName());
            dto.setLevel(s.getLevel());
            dto.setSchool(s.getSchool());
            dto.setCastingTime(s.getCastingTime());
            dto.setRange(s.getRange());
            dto.setComponents(s.getComponents());
            dto.setDuration(s.getDuration());
            dto.setDescription(s.getDescription());
            return dto;
        }
    }
}
