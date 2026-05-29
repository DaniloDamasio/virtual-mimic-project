package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class CharacterUpdateDto {

    @Size(min = 2, max = 100)
    private String characterName;
    @Size(max = 100)
    private String characterLastName;
    @Size(max = 100)
    private String playerName;
    @Min(1) @Max(9999)
    private Integer characterAge;

    @Size(max = 5000) private String characterHistory;
    @Size(max = 1000) private String characterAppearance;
    @Size(max = 1000) private String personalityTraits;
    @Size(max = 1000) private String ideals;
    @Size(max = 1000) private String bonds;
    @Size(max = 1000) private String flaws;
    @Size(max = 1000) private String goals;
    @Size(max = 50)   private String alignment;

    @Min(3) @Max(30) private Integer strength;
    @Min(3) @Max(30) private Integer dexterity;
    @Min(3) @Max(30) private Integer constitution;
    @Min(3) @Max(30) private Integer intelligence;
    @Min(3) @Max(30) private Integer wisdom;
    @Min(3) @Max(30) private Integer charisma;

    @Min(0) private Integer speed;
    @Min(0) private Integer armorClass;
    @Min(0) private Integer goldPieces;

    private List<String> skillProficiencies;
    private List<String> savingThrowProficiencies;
}
