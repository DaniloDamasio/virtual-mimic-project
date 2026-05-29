package br.com.virtualmimic.api.repository;

import br.com.virtualmimic.api.models.character.RollHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RollHistoryRepository extends JpaRepository<RollHistory, Long> {

    List<RollHistory> findByCharacter_CharacterIdOrderByRolledAtDesc(Long characterId);

    long countByCharacter_CharacterId(Long characterId);
}
