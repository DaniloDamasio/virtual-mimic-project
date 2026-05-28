package br.com.virtualmimic.api.models.character;

import br.com.virtualmimic.api.models.user.User;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
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
    private String playerName;
    private Integer characterAge;

    @Column(columnDefinition = "TEXT")
    private String characterHistory;
    @Column(columnDefinition = "TEXT")
    private String characterAppearance;
    @Column(columnDefinition = "TEXT")
    private String personalityTraits;
    @Column(columnDefinition = "TEXT")
    private String ideals;
    @Column(columnDefinition = "TEXT")
    private String bonds;
    @Column(columnDefinition = "TEXT")
    private String flaws;
    @Column(columnDefinition = "TEXT")
    private String goals;

    private String alignment;

    private Integer strength;
    private Integer dexterity;
    private Integer constitution;
    private Integer intelligence;
    private Integer wisdom;
    private Integer charisma;

    private Integer currentLevel;
    private Integer maxHealth;
    private Integer currentHealth;

    private Integer hitDie;
    private Integer speed;
    private Integer armorClass;

    private String raceSlug;
    private String raceName;

    private String classSlug;
    private String className;

    private String backgroundSlug;
    private String backgroundName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "character_skill_proficiencies", joinColumns = @JoinColumn(name = "character_id"))
    @Column(name = "skill")
    private List<String> skillProficiencies = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "character_saving_throw_proficiencies", joinColumns = @JoinColumn(name = "character_id"))
    @Column(name = "ability")
    private List<String> savingThrowProficiencies = new ArrayList<>();

    @OneToMany(mappedBy = "characterModel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CharacterEquipment> inventory = new ArrayList<>();

    @OneToMany(mappedBy = "characterModel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CharacterSpell> spells = new ArrayList<>();

    @OneToMany(mappedBy = "characterModel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<CharacterFeat> feats = new ArrayList<>();

    private Integer goldPieces;
}
