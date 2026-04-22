package br.com.virtualmimic.api.dto.response.character;

import br.com.virtualmimic.api.models.character.CharacterEquipment;
import br.com.virtualmimic.api.models.character.CharacterModel;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CharacterResponseDto {

    private Long characterId;
    private UUID ownerId;

    private String characterName;
    private String characterLastName;
    private Integer characterAge;
    private String characterHistory;
    private String characterAppearance;

    private Integer strength;
    private Integer dexterity;
    private Integer constitution;
    private Integer intelligence;
    private Integer wisdom;
    private Integer charisma;

    private Integer currentLevel;
    private Integer maxHealth;
    private Integer currentHealth;

    private Long classId;
    private String className;
    private Long raceId;
    private String raceName;
    private Long backgroundId;
    private String backgroundName;

    private List<EquipmentDto> inventory;
    private Integer goldPieces;

    public static CharacterResponseDto fromEntity(CharacterModel character) {
        CharacterResponseDto dto = new CharacterResponseDto();
        dto.setCharacterId(character.getCharacterId());
        dto.setOwnerId(character.getOwner().getUserId());

        dto.setCharacterName(character.getCharacterName());
        dto.setCharacterLastName(character.getCharacterLastName());
        dto.setCharacterAge(character.getCharacterAge());
        dto.setCharacterHistory(character.getCharacterHistory());
        dto.setCharacterAppearance(character.getCharacterAppearance());

        dto.setStrength(character.getStrength());
        dto.setDexterity(character.getDexterity());
        dto.setConstitution(character.getConstitution());
        dto.setIntelligence(character.getIntelligence());
        dto.setWisdom(character.getWisdom());
        dto.setCharisma(character.getCharisma());

        dto.setCurrentLevel(character.getCurrentLevel());
        dto.setMaxHealth(character.getMaxHealth());
        dto.setCurrentHealth(character.getCurrentHealth());

        if (character.getCharacterClass() != null) {
            dto.setClassId(character.getCharacterClass().getClassId());
            dto.setClassName(character.getCharacterClass().getClassName());
        }
        if (character.getCharacterRace() != null) {
            dto.setRaceId(character.getCharacterRace().getRaceId());
            dto.setRaceName(character.getCharacterRace().getRaceName());
        }
        if (character.getCharacterBackground() != null) {
            dto.setBackgroundId(character.getCharacterBackground().getId());
            dto.setBackgroundName(character.getCharacterBackground().getName());
        }

        if (character.getInventory() != null) {
            dto.setInventory(character.getInventory().stream()
                    .map(EquipmentDto::fromEntity)
                    .toList());
        }

        dto.setGoldPieces(character.getGoldPieces());
        return dto;
    }

    @Data
    public static class EquipmentDto {
        private Long id;
        private String name;
        private Double weight;
        private Integer quantity;
        private String damageDice;
        private Integer armorClassBonus;
        private String type;

        public static EquipmentDto fromEntity(CharacterEquipment equipment) {
            EquipmentDto dto = new EquipmentDto();
            dto.setId(equipment.getId());
            dto.setName(equipment.getName());
            dto.setWeight(equipment.getWeight());
            dto.setQuantity(equipment.getQuantity());
            dto.setDamageDice(equipment.getDamageDice());
            dto.setArmorClassBonus(equipment.getArmorClassBonus());
            dto.setType(equipment.getType() != null ? equipment.getType().name() : null);
            return dto;
        }
    }
}
