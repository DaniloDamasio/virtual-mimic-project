package br.com.virtualmimic.api.service.character;

import br.com.virtualmimic.api.dto.request.character.CharacterUpdateDto;
import br.com.virtualmimic.api.dto.request.character.CreateCharacterRequestDto;
import br.com.virtualmimic.api.dto.request.character.EquipmentRequestDto;
import br.com.virtualmimic.api.dto.request.character.FeatRequestDto;
import br.com.virtualmimic.api.dto.request.character.SpellRequestDto;
import br.com.virtualmimic.api.exception.CharacterNotFoundException;
import br.com.virtualmimic.api.exception.CharacterNotOwnedException;
import br.com.virtualmimic.api.models.character.CharacterEquipment;
import br.com.virtualmimic.api.models.character.CharacterFeat;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.models.character.CharacterSpell;
import br.com.virtualmimic.api.models.character.ItemType;
import br.com.virtualmimic.api.models.user.User;
import br.com.virtualmimic.api.repository.CharacterRepository;
import br.com.virtualmimic.api.repository.CharacterSpellRepository;
import br.com.virtualmimic.api.repository.RollHistoryRepository;
import br.com.virtualmimic.api.repository.UserRepository;
import br.com.virtualmimic.api.util.CharacterHealthCalculator;
import br.com.virtualmimic.api.util.CharacterModifiersCalculator;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CharacterService {

    private final CharacterRepository characterRepository;
    private final UserRepository userRepository;
    private final CharacterSpellRepository spellRepository;
    private final RollHistoryRepository rollHistoryRepository;

    public CharacterModel findById(Long characterId) {
        return characterRepository.findById(characterId)
                .orElseThrow(() -> new CharacterNotFoundException("Personagem não encontrado com esse id"));
    }

    public CharacterModel findByIdAndOwner(Long characterId, UUID ownerId) {
        CharacterModel character = findById(characterId);
        if (!character.getOwner().getUserId().equals(ownerId)) {
            throw new CharacterNotOwnedException("Este personagem não pertence a você");
        }
        return character;
    }

    public List<CharacterModel> findByOwnerId(UUID ownerId) {
        return characterRepository.findByOwnerUserId(ownerId);
    }

    private static int hpSubsequentLevels(int hitDie) {
        return (hitDie / 2) + 1;
    }

    @Transactional
    public CharacterModel createCharacter(CreateCharacterRequestDto dto, UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        CharacterModel c = new CharacterModel();
        c.setOwner(owner);

        c.setCharacterName(dto.getCharacterName());
        c.setCharacterLastName(dto.getCharacterLastName());
        c.setPlayerName(dto.getPlayerName());
        c.setCharacterAge(dto.getCharacterAge());
        c.setCharacterHistory(dto.getCharacterHistory());
        c.setCharacterAppearance(dto.getCharacterAppearance());
        c.setPersonalityTraits(dto.getPersonalityTraits());
        c.setIdeals(dto.getIdeals());
        c.setBonds(dto.getBonds());
        c.setFlaws(dto.getFlaws());
        c.setGoals(dto.getGoals());
        c.setAlignment(dto.getAlignment());

        c.setStrength(dto.getStrength());
        c.setDexterity(dto.getDexterity());
        c.setConstitution(dto.getConstitution());
        c.setIntelligence(dto.getIntelligence());
        c.setWisdom(dto.getWisdom());
        c.setCharisma(dto.getCharisma());

        c.setRaceSlug(dto.getRaceSlug());
        c.setRaceName(dto.getRaceName());
        c.setClassSlug(dto.getClassSlug());
        c.setClassName(dto.getClassName());
        c.setBackgroundSlug(dto.getBackgroundSlug());
        c.setBackgroundName(dto.getBackgroundName());

        c.setHitDie(dto.getHitDie());
        c.setSpeed(dto.getSpeed() != null ? dto.getSpeed() : 30);
        int dexMod = CharacterModifiersCalculator.getAbilityModifier(dto.getDexterity());
        c.setArmorClass(10 + dexMod);

        c.setSkillProficiencies(dto.getSkillProficiencies() != null
                ? new ArrayList<>(dto.getSkillProficiencies()) : new ArrayList<>());
        c.setSavingThrowProficiencies(dto.getSavingThrowProficiencies() != null
                ? new ArrayList<>(dto.getSavingThrowProficiencies()) : new ArrayList<>());

        c.setCurrentLevel(1);
        int hpFirst = dto.getHitDie();
        int hpNext = hpSubsequentLevels(dto.getHitDie());
        int maxHp = CharacterHealthCalculator.calculateBaseMaxHealth(1, hpFirst, hpNext, dto.getConstitution());
        c.setMaxHealth(maxHp);
        c.setCurrentHealth(maxHp);

        c.setGoldPieces(0);
        c.setInventory(new ArrayList<>());
        c.setSpells(new ArrayList<>());

        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel updateCharacter(Long characterId, UUID ownerId, CharacterUpdateDto dto) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);

        if (dto.getCharacterName() != null) c.setCharacterName(dto.getCharacterName());
        if (dto.getCharacterLastName() != null) c.setCharacterLastName(dto.getCharacterLastName());
        if (dto.getPlayerName() != null) c.setPlayerName(dto.getPlayerName());
        if (dto.getCharacterAge() != null) c.setCharacterAge(dto.getCharacterAge());
        if (dto.getCharacterHistory() != null) c.setCharacterHistory(dto.getCharacterHistory());
        if (dto.getCharacterAppearance() != null) c.setCharacterAppearance(dto.getCharacterAppearance());
        if (dto.getPersonalityTraits() != null) c.setPersonalityTraits(dto.getPersonalityTraits());
        if (dto.getIdeals() != null) c.setIdeals(dto.getIdeals());
        if (dto.getBonds() != null) c.setBonds(dto.getBonds());
        if (dto.getFlaws() != null) c.setFlaws(dto.getFlaws());
        if (dto.getGoals() != null) c.setGoals(dto.getGoals());
        if (dto.getAlignment() != null) c.setAlignment(dto.getAlignment());

        if (dto.getStrength() != null) c.setStrength(dto.getStrength());
        if (dto.getDexterity() != null) c.setDexterity(dto.getDexterity());
        boolean conChanged = dto.getConstitution() != null
                && !dto.getConstitution().equals(c.getConstitution());
        if (dto.getConstitution() != null) c.setConstitution(dto.getConstitution());
        if (dto.getIntelligence() != null) c.setIntelligence(dto.getIntelligence());
        if (dto.getWisdom() != null) c.setWisdom(dto.getWisdom());
        if (dto.getCharisma() != null) c.setCharisma(dto.getCharisma());

        if (conChanged && c.getHitDie() != null && c.getCurrentLevel() != null) {
            int oldMax = c.getMaxHealth() != null ? c.getMaxHealth() : 0;
            int newMax = CharacterHealthCalculator.calculateBaseMaxHealth(
                    c.getCurrentLevel(),
                    c.getHitDie(),
                    hpSubsequentLevels(c.getHitDie()),
                    c.getConstitution()
            );
            c.setMaxHealth(newMax);
            int curHp = c.getCurrentHealth() != null ? c.getCurrentHealth() : newMax;
            c.setCurrentHealth(Math.max(0, Math.min(newMax, curHp + (newMax - oldMax))));
        }

        if (dto.getSpeed() != null) c.setSpeed(dto.getSpeed());
        if (dto.getArmorClass() != null) c.setArmorClass(dto.getArmorClass());
        if (dto.getGoldPieces() != null) c.setGoldPieces(dto.getGoldPieces());

        if (dto.getSkillProficiencies() != null) {
            c.getSkillProficiencies().clear();
            c.getSkillProficiencies().addAll(dto.getSkillProficiencies());
        }
        if (dto.getSavingThrowProficiencies() != null) {
            c.getSavingThrowProficiencies().clear();
            c.getSavingThrowProficiencies().addAll(dto.getSavingThrowProficiencies());
        }

        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel levelUp(Long characterId, UUID ownerId) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);

        int curLevel = c.getCurrentLevel() != null ? c.getCurrentLevel() : 1;
        int newLevel = curLevel + 1;
        if (newLevel > 20) return c;
        c.setCurrentLevel(newLevel);

        int hitDie = c.getHitDie() != null ? c.getHitDie() : 8;
        int con = c.getConstitution() != null ? c.getConstitution() : 10;
        int newMax = CharacterHealthCalculator.calculateBaseMaxHealth(newLevel, hitDie, hpSubsequentLevels(hitDie), con);

        int oldMax = c.getMaxHealth() != null ? c.getMaxHealth() : 0;
        int curHp = c.getCurrentHealth() != null ? c.getCurrentHealth() : oldMax;
        int gained = newMax - oldMax;
        c.setMaxHealth(newMax);
        c.setCurrentHealth(curHp + Math.max(gained, 1));

        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel levelDown(Long characterId, UUID ownerId) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);

        int curLevel = c.getCurrentLevel() != null ? c.getCurrentLevel() : 1;
        int newLevel = curLevel - 1;
        if (newLevel < 1) return c;
        c.setCurrentLevel(newLevel);

        int hitDie = c.getHitDie() != null ? c.getHitDie() : 8;
        int con = c.getConstitution() != null ? c.getConstitution() : 10;
        int newMax = CharacterHealthCalculator.calculateBaseMaxHealth(newLevel, hitDie, hpSubsequentLevels(hitDie), con);

        int oldMax = c.getMaxHealth() != null ? c.getMaxHealth() : newMax;
        int curHp = c.getCurrentHealth() != null ? c.getCurrentHealth() : oldMax;
        int diff = oldMax - newMax;
        c.setMaxHealth(newMax);
        c.setCurrentHealth(Math.max(0, curHp - Math.max(diff, 0)));

        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel updateCurrentHealth(Long characterId, UUID ownerId, Integer newCurrentHealth) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        int value = newCurrentHealth != null ? newCurrentHealth : 0;
        c.setCurrentHealth(Math.max(0, value));
        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel updateMaxHealth(Long characterId, UUID ownerId, Integer newMaxHealth) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        int value = newMaxHealth != null ? newMaxHealth : 0;
        int newMax = Math.max(0, value);
        c.setMaxHealth(newMax);
        Integer curHp = c.getCurrentHealth();
        if (curHp != null && curHp > newMax) {
            c.setCurrentHealth(newMax);
        }
        return characterRepository.save(c);
    }

    @Transactional
    public void deleteCharacter(Long characterId, UUID ownerId) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        rollHistoryRepository.deleteAll(
                rollHistoryRepository.findByCharacter_CharacterIdOrderByRolledAtDesc(characterId));
        characterRepository.delete(c);
    }

    @Transactional
    public CharacterModel addEquipment(Long characterId, UUID ownerId, EquipmentRequestDto dto) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        CharacterEquipment eq = new CharacterEquipment();
        eq.setCharacterModel(c);
        eq.setSlug(dto.getSlug());
        eq.setName(dto.getName());
        eq.setDescription(dto.getDescription());
        eq.setWeight(dto.getWeight());
        eq.setQuantity(dto.getQuantity() != null ? dto.getQuantity() : 1);
        eq.setDamageDice(dto.getDamageDice());
        eq.setArmorClassBonus(dto.getArmorClassBonus());
        eq.setArmorCategory(dto.getArmorCategory());
        if (dto.getType() != null) {
            try { eq.setType(ItemType.valueOf(dto.getType())); } catch (IllegalArgumentException ignore) {}
        }
        c.getInventory().add(eq);
        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel removeEquipment(Long characterId, UUID ownerId, Long equipmentId) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        c.getInventory().removeIf(e -> e.getId().equals(equipmentId));
        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel addSpell(Long characterId, UUID ownerId, SpellRequestDto dto) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        CharacterSpell s = new CharacterSpell();
        s.setCharacterModel(c);
        s.setSlug(dto.getSlug());
        s.setName(dto.getName());
        s.setLevel(dto.getLevel());
        s.setSchool(dto.getSchool());
        s.setCastingTime(dto.getCastingTime());
        s.setRange(dto.getRange());
        s.setComponents(dto.getComponents());
        s.setDuration(dto.getDuration());
        s.setDescription(dto.getDescription());
        c.getSpells().add(s);
        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel removeSpell(Long characterId, UUID ownerId, Long spellId) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        c.getSpells().removeIf(s -> s.getId().equals(spellId));
        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel addFeat(Long characterId, UUID ownerId, FeatRequestDto dto) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        CharacterFeat f = new CharacterFeat();
        f.setCharacterModel(c);
        f.setName(dto.getName());
        f.setCategory(dto.getCategory());
        f.setActionType(dto.getActionType());
        f.setCost(dto.getCost());
        f.setDescription(dto.getDescription());
        c.getFeats().add(f);
        return characterRepository.save(c);
    }

    @Transactional
    public CharacterModel removeFeat(Long characterId, UUID ownerId, Long featId) {
        CharacterModel c = findByIdAndOwner(characterId, ownerId);
        c.getFeats().removeIf(f -> f.getId().equals(featId));
        return characterRepository.save(c);
    }
}
