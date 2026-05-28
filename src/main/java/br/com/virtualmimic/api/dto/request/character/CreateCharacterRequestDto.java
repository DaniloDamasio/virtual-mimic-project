package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class CreateCharacterRequestDto {

    @NotBlank(message = "Nome do personagem é obrigatório")
    @Size(min = 2, max = 100)
    private String characterName;

    @Size(max = 100)
    private String characterLastName;

    @Size(max = 100)
    private String playerName;

    @Min(value = 1, message = "Idade deve ser no mínimo 1")
    @Max(value = 9999)
    private Integer characterAge;

    @Size(max = 5000)
    private String characterHistory;

    @Size(max = 1000)
    private String characterAppearance;

    @Size(max = 1000)
    private String personalityTraits;

    @Size(max = 1000)
    private String ideals;

    @Size(max = 1000)
    private String bonds;

    @Size(max = 1000)
    private String flaws;

    @Size(max = 1000)
    private String goals;

    @Size(max = 50)
    private String alignment;

    @NotNull @Min(3) @Max(30)
    private Integer strength;

    @NotNull @Min(3) @Max(30)
    private Integer dexterity;

    @NotNull @Min(3) @Max(30)
    private Integer constitution;

    @NotNull @Min(3) @Max(30)
    private Integer intelligence;

    @NotNull @Min(3) @Max(30)
    private Integer wisdom;

    @NotNull @Min(3) @Max(30)
    private Integer charisma;

    @NotBlank(message = "Raça é obrigatória")
    private String raceSlug;
    @NotBlank
    private String raceName;

    @NotBlank(message = "Classe é obrigatória")
    private String classSlug;
    @NotBlank
    private String className;

    @NotNull @Min(4) @Max(20)
    private Integer hitDie;

    @NotBlank(message = "Antecedente é obrigatório")
    private String backgroundSlug;
    @NotBlank
    private String backgroundName;

    private List<String> skillProficiencies;
    private List<String> savingThrowProficiencies;

    private Integer speed;
}
