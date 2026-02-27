package br.com.virtualmimic.api.models.character;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class CharacterEquipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Double weight;
    private Integer quantity;

    @ManyToOne
    @JoinColumn(name = "character_id")
    private CharacterModel characterModel;


    private String damageDice;
    private Integer armorClassBonus;

    @Enumerated(EnumType.STRING)
    private ItemType type;
}
