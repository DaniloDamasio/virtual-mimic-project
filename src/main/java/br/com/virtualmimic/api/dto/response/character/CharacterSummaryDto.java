package br.com.virtualmimic.api.dto.response.character;

import br.com.virtualmimic.api.models.character.CharacterModel;
import lombok.Data;

@Data
public class CharacterSummaryDto {

    private Long characterId;
    private String characterName;
    private String characterLastName;
    private Integer currentLevel;
    private String classSlug;
    private String className;
    private String raceSlug;
    private String raceName;

    public static CharacterSummaryDto fromEntity(CharacterModel character) {
        CharacterSummaryDto dto = new CharacterSummaryDto();
        dto.setCharacterId(character.getCharacterId());
        dto.setCharacterName(character.getCharacterName());
        dto.setCharacterLastName(character.getCharacterLastName());
        dto.setCurrentLevel(character.getCurrentLevel());
        dto.setClassSlug(character.getClassSlug());
        dto.setClassName(character.getClassName());
        dto.setRaceSlug(character.getRaceSlug());
        dto.setRaceName(character.getRaceName());
        return dto;
    }
}
