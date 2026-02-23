package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class CharacterMaxHealthUpdateDto {
    @Min(0)
    @Max(999)
    private Integer maxHealth;
}
