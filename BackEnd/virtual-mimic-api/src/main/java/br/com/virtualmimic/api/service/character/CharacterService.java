package br.com.virtualmimic.api.service.character;

import br.com.virtualmimic.api.exception.CharacterNotFoundException;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.repository.CharacterRepository;
import br.com.virtualmimic.api.util.CharacterHealthCalculator;
import br.com.virtualmimic.api.util.CharacterModifiersCalculator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CharacterService {
    private final CharacterRepository characterRepository;

    // GET ARGUMENTS

    // FIND CHARACTER BY ID
    public CharacterModel findById(Long characterId) {
        return characterRepository.findById(characterId)
                .orElseThrow(() -> new CharacterNotFoundException("Personagem não encontrado com esse id"));
    }

    // RETURNS ALL CHARACTER'S MODIFIERS
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








    // CREATE AND PATCH ARGUMENTS

    // LEVELS UP CHARACTER, UPDATING HEALTH, POINTS AND ADDING FEATURES
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

        character.setMaxHealth(maxHealth);
        character.setCurrentHealth(
                character.getCurrentHealth()+
                (character.getCharacterClass().getHpSubsequentLevels()+CharacterModifiersCalculator.getAbilityModifier(character.getConstitution())));

        return characterRepository.save(character);
    }

    // UPDATE CURRENT CHARACTER HEALTH
    @Transactional
    public CharacterModel updateCurrentHealth(Long characterId, Integer newCurrentHealth) {
        CharacterModel characterModel = findById(characterId);

        int value = newCurrentHealth != null ? newCurrentHealth : 0;
        characterModel.setCurrentHealth(Math.max(0, value));

        return characterRepository.save(characterModel);
    }

    // UPDATE CHARACTER MAX HEALTH
    @Transactional
    public CharacterModel updateMaxHealth(Long characterId, Integer newMaxHealth) {
        CharacterModel characterModel = findById(characterId);

        int value = newMaxHealth != null ? newMaxHealth : 0;
        characterModel.setMaxHealth(Math.max(0, value));

        return characterRepository.save(characterModel);
    }



}
