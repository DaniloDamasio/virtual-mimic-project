package br.com.virtualmimic.api.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class CharacterEquipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // ID único para cada item no mundo

    private String name;
    private Double weight;
    private Integer quantity;

    // Relacionamento com o dono do item
    @ManyToOne
    @JoinColumn(name = "character_id")
    private Character character;

    // Campos específicos para itens de combate
    private String damageDice; // Ex: "1d8"
    private Integer armorClassBonus; // Ex: +2 para escudos

    @Enumerated(EnumType.STRING)
    private ItemType type;
}
