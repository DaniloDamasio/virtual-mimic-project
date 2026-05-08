package br.com.virtualmimic.api.repository;

import br.com.virtualmimic.api.models.character.CharacterModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CharacterRepository extends JpaRepository<CharacterModel, Long> {
    List<CharacterModel> findByOwnerUserId(UUID userId);
}
