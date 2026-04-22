package br.com.virtualmimic.api.models.character;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CharacterRace {

    @Id
    @EqualsAndHashCode.Include
    private Long raceId;

    private String raceName;
    private Integer raceSpeed;

    @OneToMany(mappedBy = "race", cascade = CascadeType.ALL)
    private List<CharacterFeature> racialFeatures;

    @ElementCollection
    private Map<String, Integer> attributeBonuses;
}
