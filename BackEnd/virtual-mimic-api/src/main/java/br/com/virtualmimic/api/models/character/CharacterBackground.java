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
public class CharacterBackground {

    @Id
    @EqualsAndHashCode.Include
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String backgroundFeatureDescription;

    @ElementCollection
    private List<String> grantedSkills;

    @OneToMany(mappedBy = "background", cascade = CascadeType.ALL)
    private List<CharacterFeature> backgroundFeatures;
}
