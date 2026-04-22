package br.com.virtualmimic.api.models.character;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CharacterClass {

    @Id
    @EqualsAndHashCode.Include
    private Long classId;

    private String className;

    private Integer hpFirstLevel;
    private Integer hpSubsequentLevels;

    @ElementCollection
    private List<String> savingThrowProficiencies;

    @OneToMany(mappedBy = "characterClass", cascade = CascadeType.ALL)
    private List<CharacterFeature> classFeatures;

    private boolean isSpellcaster;
    private Integer manaPoints;
}
