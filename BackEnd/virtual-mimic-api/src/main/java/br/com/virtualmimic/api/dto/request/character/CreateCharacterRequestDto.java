package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateCharacterRequestDto {

    @NotBlank(message = "Nome do personagem é obrigatório")
    @Size(min = 2, max = 100)
    private String characterName;

    @Size(max = 100)
    private String characterLastName;

    @Min(value = 1, message = "Idade deve ser no mínimo 1")
    @Max(value = 9999)
    private Integer characterAge;

    @Size(max = 5000)
    private String characterHistory;

    @Size(max = 1000)
    private String characterAppearance;

    @NotNull(message = "Força é obrigatória")
    @Min(value = 3, message = "Atributo mínimo é 3")
    @Max(value = 20, message = "Atributo máximo é 20")
    private Integer strength;

    @NotNull(message = "Destreza é obrigatória")
    @Min(value = 3, message = "Atributo mínimo é 3")
    @Max(value = 20, message = "Atributo máximo é 20")
    private Integer dexterity;

    @NotNull(message = "Constituição é obrigatória")
    @Min(value = 3, message = "Atributo mínimo é 3")
    @Max(value = 20, message = "Atributo máximo é 20")
    private Integer constitution;

    @NotNull(message = "Inteligência é obrigatória")
    @Min(value = 3, message = "Atributo mínimo é 3")
    @Max(value = 20, message = "Atributo máximo é 20")
    private Integer intelligence;

    @NotNull(message = "Sabedoria é obrigatória")
    @Min(value = 3, message = "Atributo mínimo é 3")
    @Max(value = 20, message = "Atributo máximo é 20")
    private Integer wisdom;

    @NotNull(message = "Carisma é obrigatório")
    @Min(value = 3, message = "Atributo mínimo é 3")
    @Max(value = 20, message = "Atributo máximo é 20")
    private Integer charisma;

    @NotNull(message = "Classe é obrigatória")
    private Long classId;

    @NotNull(message = "Raça é obrigatória")
    private Long raceId;

    @NotNull(message = "Background é obrigatório")
    private Long backgroundId;
}
