package br.com.virtualmimic.api.controller.character;

import br.com.virtualmimic.api.dto.request.character.CharacterCurrentHealthUpdateDto;
import br.com.virtualmimic.api.dto.request.character.CharacterMaxHealthUpdateDto;
import br.com.virtualmimic.api.dto.request.character.CharacterUpdateDto;
import br.com.virtualmimic.api.dto.request.character.CreateCharacterRequestDto;
import br.com.virtualmimic.api.dto.request.character.EquipmentRequestDto;
import br.com.virtualmimic.api.dto.request.character.FeatRequestDto;
import br.com.virtualmimic.api.dto.request.character.RollRequestDto;
import br.com.virtualmimic.api.dto.request.character.SpellRequestDto;
import br.com.virtualmimic.api.dto.response.character.CharacterResponseDto;
import br.com.virtualmimic.api.dto.response.character.CharacterSummaryDto;
import br.com.virtualmimic.api.dto.response.character.RollHistoryDto;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.service.character.CharacterService;
import br.com.virtualmimic.api.service.character.RollHistoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
public class CharacterController {

    private final CharacterService characterService;
    private final RollHistoryService rollHistoryService;

    @PostMapping
    public ResponseEntity<CharacterResponseDto> createCharacter(
            @Valid @RequestBody CreateCharacterRequestDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel character = characterService.createCharacter(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(CharacterResponseDto.fromEntity(character));
    }

    @GetMapping("/my")
    public ResponseEntity<List<CharacterSummaryDto>> getMyCharacters(Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        List<CharacterSummaryDto> characters = characterService.findByOwnerId(userId).stream()
                .map(CharacterSummaryDto::fromEntity)
                .toList();
        return ResponseEntity.ok(characters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CharacterResponseDto> getById(@PathVariable Long id, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel character = characterService.findByIdAndOwner(id, userId);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(character));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<CharacterResponseDto> updateCharacter(
            @PathVariable Long id,
            @Valid @RequestBody CharacterUpdateDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.updateCharacter(id, userId, dto);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PatchMapping("/{id}/current-health")
    public ResponseEntity<CharacterResponseDto> updateHealth(
            @PathVariable Long id,
            @RequestBody @Valid CharacterCurrentHealthUpdateDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.updateCurrentHealth(id, userId, dto.getCurrentHealth());
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PatchMapping("/{id}/max-health")
    public ResponseEntity<CharacterResponseDto> updateMaxHealth(
            @PathVariable Long id,
            @RequestBody @Valid CharacterMaxHealthUpdateDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.updateMaxHealth(id, userId, dto.getMaxHealth());
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PostMapping("/{id}/level-up")
    public ResponseEntity<CharacterResponseDto> levelUp(@PathVariable Long id, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.levelUp(id, userId);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PostMapping("/{id}/level-down")
    public ResponseEntity<CharacterResponseDto> levelDown(@PathVariable Long id, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.levelDown(id, userId);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable Long id, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        characterService.deleteCharacter(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/inventory")
    public ResponseEntity<CharacterResponseDto> addEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequestDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.addEquipment(id, userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(CharacterResponseDto.fromEntity(updated));
    }

    @DeleteMapping("/{id}/inventory/{equipmentId}")
    public ResponseEntity<CharacterResponseDto> removeEquipment(
            @PathVariable Long id,
            @PathVariable Long equipmentId,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.removeEquipment(id, userId, equipmentId);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PostMapping("/{id}/spells")
    public ResponseEntity<CharacterResponseDto> addSpell(
            @PathVariable Long id,
            @Valid @RequestBody SpellRequestDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.addSpell(id, userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(CharacterResponseDto.fromEntity(updated));
    }

    @DeleteMapping("/{id}/spells/{spellId}")
    public ResponseEntity<CharacterResponseDto> removeSpell(
            @PathVariable Long id,
            @PathVariable Long spellId,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.removeSpell(id, userId, spellId);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PostMapping("/{id}/feats")
    public ResponseEntity<CharacterResponseDto> addFeat(
            @PathVariable Long id,
            @Valid @RequestBody FeatRequestDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.addFeat(id, userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(CharacterResponseDto.fromEntity(updated));
    }

    @DeleteMapping("/{id}/feats/{featId}")
    public ResponseEntity<CharacterResponseDto> removeFeat(
            @PathVariable Long id,
            @PathVariable Long featId,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        CharacterModel updated = characterService.removeFeat(id, userId, featId);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PostMapping("/{id}/rolls")
    public ResponseEntity<RollHistoryDto> recordRoll(
            @PathVariable Long id,
            @Valid @RequestBody RollRequestDto dto,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(
                RollHistoryDto.fromEntity(rollHistoryService.record(id, userId, dto)));
    }

    @GetMapping("/{id}/rolls")
    public ResponseEntity<List<RollHistoryDto>> listRolls(
            @PathVariable Long id,
            Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        List<RollHistoryDto> rolls = rollHistoryService.list(id, userId).stream()
                .map(RollHistoryDto::fromEntity)
                .toList();
        return ResponseEntity.ok(rolls);
    }
}
