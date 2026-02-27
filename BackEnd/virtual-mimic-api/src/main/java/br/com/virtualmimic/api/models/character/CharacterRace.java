package br.com.virtualmimic.api.models.character;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Entity
@Data
@NoArgsConstructor
public class CharacterRace {
    @Id
    private Long raceId;
    private String raceName;
    private Integer raceSpeed;

    @OneToMany(mappedBy = "characterRace", cascade = CascadeType.ALL)
    private List<CharacterFeature> racialFeatures;

    @ElementCollection
    private Map<String, Integer> attributeBonuses;
}
