package br.com.virtualmimic.api.models.character;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CharacterFeature {

    @Id
    @EqualsAndHashCode.Include
    private Long id;

    private String name;
    private Integer levelRequired;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "class_id")
    private CharacterClass characterClass;

    @ManyToOne
    @JoinColumn(name = "race_id")
    private CharacterRace race;

    @ManyToOne
    @JoinColumn(name = "background_id")
    private CharacterBackground background;
}
