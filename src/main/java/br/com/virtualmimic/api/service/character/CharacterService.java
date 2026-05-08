package br.com.virtualmimic.api.service.character;

import br.com.virtualmimic.api.dto.request.character.CreateCharacterRequestDto;
import br.com.virtualmimic.api.exception.CharacterNotFoundException;
import br.com.virtualmimic.api.models.character.CharacterBackground;
import br.com.virtualmimic.api.models.character.CharacterClass;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.models.character.CharacterRace;
import br.com.virtualmimic.api.models.user.User;
import br.com.virtualmimic.api.repository.CharacterRepository;
import br.com.virtualmimic.api.repository.UserRepository;
import br.com.virtualmimic.api.service.reference.ReferenceDataService;
import br.com.virtualmimic.api.util.CharacterHealthCalculator;
import br.com.virtualmimic.api.util.CharacterModifiersCalculator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CharacterService {

    private final CharacterRepository characterRepository;
    private final UserRepository userRepository;
    private final ReferenceDataService referenceDataService;

    public CharacterModel findById(Long characterId) {
        return characterRepository.findById(characterId)
                .orElseThrow(() -> new CharacterNotFoundException("Personagem não encontrado com esse id"));
    }

    public List<CharacterModel> findByOwnerId(UUID ownerId) {
        return characterRepository.findByOwnerUserId(ownerId);
    }

    public Map<String, Integer> getAbilityModifiers(CharacterModel character) {
        Map<String, Integer> mods = new HashMap<>();
        mods.put("STR", CharacterModifiersCalculator.getAbilityModifier(character.getStrength()));
        mods.put("DEX", CharacterModifiersCalculator.getAbilityModifier(character.getDexterity()));
        mods.put("CON", CharacterModifiersCalculator.getAbilityModifier(character.getConstitution()));
        mods.put("INT", CharacterModifiersCalculator.getAbilityModifier(character.getIntelligence()));
        mods.put("WIS", CharacterModifiersCalculator.getAbilityModifier(character.getWisdom()));
        mods.put("CHA", CharacterModifiersCalculator.getAbilityModifier(character.getCharisma()));
        return mods;
    }

    @Transactional
    public CharacterModel createCharacter(CreateCharacterRequestDto dto, UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        CharacterClass charClass = referenceDataService.findClassById(dto.getClassId());
        CharacterRace charRace = referenceDataService.findRaceById(dto.getRaceId());
        CharacterBackground charBg = referenceDataService.findBackgroundById(dto.getBackgroundId());

        CharacterModel character = new CharacterModel();
        character.setOwner(owner);

        character.setCharacterName(dto.getCharacterName());
        character.setCharacterLastName(dto.getCharacterLastName());
        character.setCharacterAge(dto.getCharacterAge());
        character.setCharacterHistory(dto.getCharacterHistory());
        character.setCharacterAppearance(dto.getCharacterAppearance());

        int str = dto.getStrength();
        int dex = dto.getDexterity();
        int con = dto.getConstitution();
        int intel = dto.getIntelligence();
        int wis = dto.getWisdom();
        int cha = dto.getCharisma();

        Map<String, Integer> bonuses = charRace.getAttributeBonuses();
        if (bonuses != null) {
            str += bonuses.getOrDefault("STR", 0);
            dex += bonuses.getOrDefault("DEX", 0);
            con += bonuses.getOrDefault("CON", 0);
            intel += bonuses.getOrDefault("INT", 0);
            wis += bonuses.getOrDefault("WIS", 0);
            cha += bonuses.getOrDefault("CHA", 0);
        }

        character.setStrength(str);
        character.setDexterity(dex);
        character.setConstitution(con);
        character.setIntelligence(intel);
        character.setWisdom(wis);
        character.setCharisma(cha);

        character.setCharacterClass(charClass);
        character.setCharacterRace(charRace);
        character.setCharacterBackground(charBg);

        character.setCurrentLevel(1);

        int maxHealth = CharacterHealthCalculator.calculateBaseMaxHealth(
                1, charClass.getHpFirstLevel(), charClass.getHpSubsequentLevels(), con);
        character.setMaxHealth(maxHealth);
        character.setCurrentHealth(maxHealth);

        character.setGoldPieces(0);
        character.setInventory(new ArrayList<>());

        return characterRepository.save(character);
    }

    @Transactional
    public CharacterModel levelUp(Long characterId) {
        CharacterModel character = findById(characterId);

        int newLevel = character.getCurrentLevel() + 1;
        character.setCurrentLevel(newLevel);

        int maxHealth = CharacterHealthCalculator.calculateBaseMaxHealth(
                newLevel,
                character.getCharacterClass().getHpFirstLevel(),
                character.getCharacterClass().getHpSubsequentLevels(),
                character.getConstitution()
        );

        int hpGain = character.getCharacterClass().getHpSubsequentLevels()
                + CharacterModifiersCalculator.getAbilityModifier(character.getConstitution());
        character.setMaxHealth(maxHealth);
        character.setCurrentHealth(character.getCurrentHealth() + Math.max(hpGain, 1));

        return characterRepository.save(character);
    }

    @Transactional
    public CharacterModel updateCurrentHealth(Long characterId, Integer newCurrentHealth) {
        CharacterModel characterModel = findById(characterId);

        int value = newCurrentHealth != null ? newCurrentHealth : 0;
        characterModel.setCurrentHealth(Math.max(0, value));

        return characterRepository.save(characterModel);
    }

    @Transactional
    public CharacterModel updateMaxHealth(Long characterId, Integer newMaxHealth) {
        CharacterModel characterModel = findById(characterId);

        int value = newMaxHealth != null ? newMaxHealth : 0;
        characterModel.setMaxHealth(Math.max(0, value));

        return characterRepository.save(characterModel);
    }

    @Transactional
    public void deleteCharacter(Long characterId, UUID ownerId) {
        CharacterModel character = findById(characterId);
        if (!character.getOwner().getUserId().equals(ownerId)) {
            throw new IllegalArgumentException("Este personagem não pertence a você");
        }
        characterRepository.delete(character);
    }
}
