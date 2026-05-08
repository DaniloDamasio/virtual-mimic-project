package br.com.virtualmimic.api.dto.response.character;

import br.com.virtualmimic.api.models.character.CharacterModel;
import lombok.Data;

@Data
public class CharacterSummaryDto {

    private Long characterId;
    private String characterName;
    private String characterLastName;
    private Integer currentLevel;
    private String className;
    private String raceName;

    public static CharacterSummaryDto fromEntity(CharacterModel character) {
        CharacterSummaryDto dto = new CharacterSummaryDto();
        dto.setCharacterId(character.getCharacterId());
        dto.setCharacterName(character.getCharacterName());
        dto.setCharacterLastName(character.getCharacterLastName());
        dto.setCurrentLevel(character.getCurrentLevel());

        if (character.getCharacterClass() != null) {
            dto.setClassName(character.getCharacterClass().getClassName());
        }
        if (character.getCharacterRace() != null) {
            dto.setRaceName(character.getCharacterRace().getRaceName());
        }

        return dto;
    }
}
