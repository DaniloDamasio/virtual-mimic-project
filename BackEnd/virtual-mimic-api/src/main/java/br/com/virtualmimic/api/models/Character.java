package br.com.virtualmimic.api.models;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Character {

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

    // Character core attributes
    private Integer strength;
    private Integer dexterity;
    private Integer constitution;
    private Integer intelligence;
    private Integer wisdom;
    private Integer charisma;

    // To determine character evolution
    private Integer currentLevel;

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
