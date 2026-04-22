package br.com.virtualmimic.api.controller.character;

import br.com.virtualmimic.api.dto.request.character.CharacterCurrentHealthUpdateDto;
import br.com.virtualmimic.api.dto.request.character.CharacterMaxHealthUpdateDto;
import br.com.virtualmimic.api.dto.request.character.CreateCharacterRequestDto;
import br.com.virtualmimic.api.dto.response.character.CharacterResponseDto;
import br.com.virtualmimic.api.dto.response.character.CharacterSummaryDto;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.service.character.CharacterService;
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
    public ResponseEntity<CharacterResponseDto> getById(@PathVariable Long id) {
        CharacterModel character = characterService.findById(id);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(character));
    }

    @PatchMapping("/{id}/current-health")
    public ResponseEntity<CharacterResponseDto> updateHealth(
            @PathVariable Long id,
            @RequestBody @Valid CharacterCurrentHealthUpdateDto dto) {
        CharacterModel updated = characterService.updateCurrentHealth(id, dto.getCurrentHealth());
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PatchMapping("/{id}/max-health")
    public ResponseEntity<CharacterResponseDto> updateMaxHealth(
            @PathVariable Long id,
            @RequestBody @Valid CharacterMaxHealthUpdateDto dto) {
        CharacterModel updated = characterService.updateMaxHealth(id, dto.getMaxHealth());
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @PostMapping("/{id}/level-up")
    public ResponseEntity<CharacterResponseDto> levelUp(@PathVariable Long id) {
        CharacterModel updated = characterService.levelUp(id);
        return ResponseEntity.ok(CharacterResponseDto.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharacter(@PathVariable Long id, Authentication authentication) {
        UUID userId = (UUID) authentication.getPrincipal();
        characterService.deleteCharacter(id, userId);
        return ResponseEntity.noContent().build();
    }
}
