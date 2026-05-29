package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EquipmentRequestDto {

    @Size(max = 100)
    private String slug;

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 2000)
    private String description;

    private Double weight;
    private Integer quantity;

    @Size(max = 50)
    private String damageDice;

    private Integer armorClassBonus;

    @Size(max = 50)
    private String type;

    @Size(max = 30)
    private String armorCategory;
}
