package br.com.virtualmimic.api.repository;

import br.com.virtualmimic.api.models.character.CharacterSpell;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterSpellRepository extends JpaRepository<CharacterSpell, Long> {
}
