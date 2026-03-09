package br.com.virtualmimic.api.dto.response.reference;

import br.com.virtualmimic.api.models.character.CharacterClass;
import lombok.Data;

import java.util.List;

@Data
public class ClassResponseDto {
    private Long classId;
    private String className;
    private Integer hpFirstLevel;
    private Integer hpSubsequentLevels;
    private List<String> savingThrowProficiencies;
    private boolean spellcaster;
    private Integer manaPoints;

    public static ClassResponseDto fromEntity(CharacterClass entity) {
        ClassResponseDto dto = new ClassResponseDto();
        dto.setClassId(entity.getClassId());
        dto.setClassName(entity.getClassName());
        dto.setHpFirstLevel(entity.getHpFirstLevel());
        dto.setHpSubsequentLevels(entity.getHpSubsequentLevels());
        dto.setSavingThrowProficiencies(entity.getSavingThrowProficiencies());
        dto.setSpellcaster(entity.isSpellcaster());
        dto.setManaPoints(entity.getManaPoints());
        return dto;
    }
}
