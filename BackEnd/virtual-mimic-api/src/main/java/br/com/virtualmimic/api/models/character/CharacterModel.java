package br.com.virtualmimic.api.models.character;

import br.com.virtualmimic.api.models.user.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@NoArgsConstructor
@Data
public class CharacterModel {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User owner;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long characterId;

    // Basic information about the character
    private String characterName;
    private String characterLastName;
    private Integer characterAge;
    @Column(columnDefinition = "TEXT")
    private String characterHistory;
    private String characterAppearance;

    // CharacterModel core attributes
    private Integer strength;
    private Integer dexterity;
    private Integer constitution;
    private Integer intelligence;
    private Integer wisdom;
    private Integer charisma;

    // To determine character evolution
    private Integer currentLevel;

    // To determine character current state
    private Integer maxHealth;
    private Integer currentHealth;

    // Core character characteristics
    @ManyToOne
    @JoinColumn(name = "class_id")
    private CharacterClass characterClass;

    @ManyToOne
    @JoinColumn(name = "race_id")
    private CharacterRace characterRace;

    @ManyToOne
    @JoinColumn(name = "background_id")
    private CharacterBackground characterBackground;

    @OneToMany(mappedBy = "character")
    private List<CharacterEquipment> inventory;

    private Integer goldPieces;
}
