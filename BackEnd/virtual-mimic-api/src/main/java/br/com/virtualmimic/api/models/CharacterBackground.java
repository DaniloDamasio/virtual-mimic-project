package br.com.virtualmimic.api.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class CharacterBackground {
    @Id
    private Long id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String backgroundFeatureDescription;

    @ElementCollection
    private List<String> grantedSkills;

    @OneToMany(mappedBy = "background", cascade = CascadeType.ALL)
    private List<CharacterFeature> backgroundFeatures;
}
