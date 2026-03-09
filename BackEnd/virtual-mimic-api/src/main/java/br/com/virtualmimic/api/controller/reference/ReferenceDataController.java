package br.com.virtualmimic.api.controller.reference;

import br.com.virtualmimic.api.dto.response.reference.ClassResponseDto;
import br.com.virtualmimic.api.dto.response.reference.BackgroundResponseDto;
import br.com.virtualmimic.api.dto.response.reference.RaceResponseDto;
import br.com.virtualmimic.api.service.reference.ReferenceDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReferenceDataController {

    private final ReferenceDataService referenceDataService;

    @GetMapping("/classes")
    public ResponseEntity<List<ClassResponseDto>> getAllClasses() {
        List<ClassResponseDto> classes = referenceDataService.findAllClasses().stream()
                .map(ClassResponseDto::fromEntity)
                .toList();
        return ResponseEntity.ok(classes);
    }

    @GetMapping("/classes/{id}")
    public ResponseEntity<ClassResponseDto> getClassById(@PathVariable Long id) {
        return ResponseEntity.ok(ClassResponseDto.fromEntity(referenceDataService.findClassById(id)));
    }

    @GetMapping("/races")
    public ResponseEntity<List<RaceResponseDto>> getAllRaces() {
        List<RaceResponseDto> races = referenceDataService.findAllRaces().stream()
                .map(RaceResponseDto::fromEntity)
                .toList();
        return ResponseEntity.ok(races);
    }

    @GetMapping("/races/{id}")
    public ResponseEntity<RaceResponseDto> getRaceById(@PathVariable Long id) {
        return ResponseEntity.ok(RaceResponseDto.fromEntity(referenceDataService.findRaceById(id)));
    }

    @GetMapping("/backgrounds")
    public ResponseEntity<List<BackgroundResponseDto>> getAllBackgrounds() {
        List<BackgroundResponseDto> backgrounds = referenceDataService.findAllBackgrounds().stream()
                .map(BackgroundResponseDto::fromEntity)
                .toList();
        return ResponseEntity.ok(backgrounds);
    }

    @GetMapping("/backgrounds/{id}")
    public ResponseEntity<BackgroundResponseDto> getBackgroundById(@PathVariable Long id) {
        return ResponseEntity.ok(BackgroundResponseDto.fromEntity(referenceDataService.findBackgroundById(id)));
    }
}
