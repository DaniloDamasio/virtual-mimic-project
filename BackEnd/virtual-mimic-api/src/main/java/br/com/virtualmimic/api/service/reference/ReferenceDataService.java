package br.com.virtualmimic.api.service.reference;

import br.com.virtualmimic.api.models.character.CharacterBackground;
import br.com.virtualmimic.api.models.character.CharacterClass;
import br.com.virtualmimic.api.models.character.CharacterRace;
import br.com.virtualmimic.api.repository.CharacterBackgroundRepository;
import br.com.virtualmimic.api.repository.CharacterClassRepository;
import br.com.virtualmimic.api.repository.CharacterRaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReferenceDataService {

    private final CharacterClassRepository classRepository;
    private final CharacterRaceRepository raceRepository;
    private final CharacterBackgroundRepository backgroundRepository;

    public List<CharacterClass> findAllClasses() {
        return classRepository.findAll();
    }

    public CharacterClass findClassById(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Classe não encontrada com id: " + id));
    }

    public List<CharacterRace> findAllRaces() {
        return raceRepository.findAll();
    }

    public CharacterRace findRaceById(Long id) {
        return raceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Raça não encontrada com id: " + id));
    }

    public List<CharacterBackground> findAllBackgrounds() {
        return backgroundRepository.findAll();
    }

    public CharacterBackground findBackgroundById(Long id) {
        return backgroundRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Background não encontrado com id: " + id));
    }
}
