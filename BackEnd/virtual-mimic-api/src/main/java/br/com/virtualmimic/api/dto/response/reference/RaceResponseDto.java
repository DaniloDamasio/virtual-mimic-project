package br.com.virtualmimic.api.dto.response.reference;

import br.com.virtualmimic.api.models.character.CharacterRace;
import lombok.Data;

import java.util.Map;

@Data
public class RaceResponseDto {
    private Long raceId;
    private String raceName;
    private Integer raceSpeed;
    private Map<String, Integer> attributeBonuses;

    public static RaceResponseDto fromEntity(CharacterRace entity) {
        RaceResponseDto dto = new RaceResponseDto();
        dto.setRaceId(entity.getRaceId());
        dto.setRaceName(entity.getRaceName());
        dto.setRaceSpeed(entity.getRaceSpeed());
        dto.setAttributeBonuses(entity.getAttributeBonuses());
        return dto;
    }
}
