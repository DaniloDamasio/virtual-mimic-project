package br.com.virtualmimic.api.repository;

import br.com.virtualmimic.api.models.character.CharacterBackground;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterBackgroundRepository extends JpaRepository<CharacterBackground, Long> {
}
