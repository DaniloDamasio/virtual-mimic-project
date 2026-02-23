package br.com.virtualmimic.api.controller.character;

import br.com.virtualmimic.api.dto.request.character.CharacterCurrentHealthUpdateDto;
import br.com.virtualmimic.api.dto.request.character.CharacterMaxHealthUpdateDto;
import br.com.virtualmimic.api.models.character.CharacterModel;
import br.com.virtualmimic.api.service.character.CharacterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/characters")
@RequiredArgsConstructor
public class CharacterController {
    private final CharacterService characterService;

    @GetMapping("/{id}")
    public ResponseEntity<CharacterModel> getById(@PathVariable Long id) {
        CharacterModel character = characterService.findById(id);
        return ResponseEntity.ok(character);
    }

    @PatchMapping("/{id}/current-health")
    public ResponseEntity<CharacterModel> updateHealth(@PathVariable Long id, @RequestBody @Valid CharacterCurrentHealthUpdateDto dto) {
        CharacterModel updated = characterService.updateCurrentHealth(id, dto.getCurrentHealth());
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/max-health")
    public ResponseEntity<CharacterModel> updateMaxHealth(@PathVariable Long id,@RequestBody @Valid CharacterMaxHealthUpdateDto dto) {
        CharacterModel updated = characterService.updateMaxHealth(id, dto.getMaxHealth());
        return ResponseEntity.ok(updated);
    }
}
