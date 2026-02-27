package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class CharacterCurrentHealthUpdateDto {
    @Min(0)
    @Max(999)
    private Integer currentHealth;
}
