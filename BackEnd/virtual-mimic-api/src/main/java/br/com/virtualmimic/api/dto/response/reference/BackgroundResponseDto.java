package br.com.virtualmimic.api.dto.response.reference;

import br.com.virtualmimic.api.models.character.CharacterBackground;
import lombok.Data;

import java.util.List;

@Data
public class BackgroundResponseDto {
    private Long id;
    private String name;
    private String backgroundFeatureDescription;
    private List<String> grantedSkills;

    public static BackgroundResponseDto fromEntity(CharacterBackground entity) {
        BackgroundResponseDto dto = new BackgroundResponseDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setBackgroundFeatureDescription(entity.getBackgroundFeatureDescription());
        dto.setGrantedSkills(entity.getGrantedSkills());
        return dto;
    }
}
