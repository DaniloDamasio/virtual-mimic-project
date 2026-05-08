package br.com.virtualmimic.api.repository;

import br.com.virtualmimic.api.models.character.CharacterClass;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterClassRepository extends JpaRepository<CharacterClass, Long> {
}
