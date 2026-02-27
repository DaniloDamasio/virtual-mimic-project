package br.com.virtualmimic.api.models.character;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class CharacterFeature {
    @Id
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
