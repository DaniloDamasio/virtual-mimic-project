package br.com.virtualmimic.api.repository;

import br.com.virtualmimic.api.models.character.CharacterModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterRepository extends JpaRepository<CharacterModel, Long> {
}
