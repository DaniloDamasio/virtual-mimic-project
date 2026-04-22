package br.com.virtualmimic.api.models.character;

import br.com.virtualmimic.api.models.user.User;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@NoArgsConstructor
@Table(name = "characters")
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class CharacterModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long characterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    private String characterName;
    private String characterLastName;
    private Integer characterAge;
    @Column(columnDefinition = "TEXT")
    private String characterHistory;
    private String characterAppearance;

    private Integer strength;
    private Integer dexterity;
    private Integer constitution;
    private Integer intelligence;
    private Integer wisdom;
    private Integer charisma;

    private Integer currentLevel;

    private Integer maxHealth;
    private Integer currentHealth;

    @ManyToOne
    @JoinColumn(name = "class_id")
    private CharacterClass characterClass;

    @ManyToOne
    @JoinColumn(name = "race_id")
    private CharacterRace characterRace;

    @ManyToOne
    @JoinColumn(name = "background_id")
    private CharacterBackground characterBackground;

    @OneToMany(mappedBy = "characterModel", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CharacterEquipment> inventory;

    private Integer goldPieces;
}
