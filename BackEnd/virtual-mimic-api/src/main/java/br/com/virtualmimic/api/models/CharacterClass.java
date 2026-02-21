package br.com.virtualmimic.api.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class CharacterClass {
        @Id
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
