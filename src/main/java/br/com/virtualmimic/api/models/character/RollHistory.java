package br.com.virtualmimic.api.models.character;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "roll_history")
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class RollHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "character_id", nullable = false)
    private CharacterModel character;

    private String label;
    private String notation;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "roll_history_rolls", joinColumns = @JoinColumn(name = "roll_id"))
    @Column(name = "die_value")
    private List<Integer> rolls = new ArrayList<>();

    private Integer total;
    private Instant rolledAt;
}
