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
public class CharacterEquipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String slug;
    private String name;
    @Column(columnDefinition = "TEXT")
    private String description;
    private Double weight;
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private CharacterModel characterModel;

    private String damageDice;
    private Integer armorClassBonus;
    private String armorCategory;

    @Enumerated(EnumType.STRING)
    private ItemType type;
}
