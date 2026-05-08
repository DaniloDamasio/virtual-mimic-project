package br.com.virtualmimic.api.repository;

import br.com.virtualmimic.api.models.character.CharacterRace;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterRaceRepository extends JpaRepository<CharacterRace, Long> {
}
