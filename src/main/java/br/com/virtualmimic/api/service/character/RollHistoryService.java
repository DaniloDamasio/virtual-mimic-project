package br.com.virtualmimic.api.service.character;

import br.com.virtualmimic.api.dto.request.character.RollRequestDto;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.models.character.RollHistory;
import br.com.virtualmimic.api.repository.RollHistoryRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RollHistoryService {

    private static final int MAX_HISTORY_PER_CHARACTER = 50;

    private final CharacterService characterService;
    private final RollHistoryRepository rollRepository;

    @Transactional
    public RollHistory record(Long characterId, UUID ownerId, RollRequestDto dto) {
        CharacterModel character = characterService.findByIdAndOwner(characterId, ownerId);

        RollHistory roll = new RollHistory();
        roll.setCharacter(character);
        roll.setLabel(dto.getLabel());
        roll.setNotation(dto.getNotation());
        roll.setRolls(new ArrayList<>(dto.getRolls()));
        roll.setTotal(dto.getTotal());
        roll.setRolledAt(Instant.now());
        RollHistory saved = rollRepository.save(roll);

        trimOldHistory(characterId);
        return saved;
    }

    public List<RollHistory> list(Long characterId, UUID ownerId) {
        characterService.findByIdAndOwner(characterId, ownerId);
        return rollRepository.findByCharacter_CharacterIdOrderByRolledAtDesc(characterId);
    }

    private void trimOldHistory(Long characterId) {
        List<RollHistory> all = rollRepository.findByCharacter_CharacterIdOrderByRolledAtDesc(characterId);
        if (all.size() > MAX_HISTORY_PER_CHARACTER) {
            List<RollHistory> toRemove = all.subList(MAX_HISTORY_PER_CHARACTER, all.size());
            rollRepository.deleteAll(toRemove);
        }
    }
}
