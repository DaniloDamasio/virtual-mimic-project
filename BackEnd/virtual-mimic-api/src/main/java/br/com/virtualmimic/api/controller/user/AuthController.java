package br.com.virtualmimic.api.controller.user;

import br.com.virtualmimic.api.dto.request.user.LoginRequestDto;
import br.com.virtualmimic.api.dto.request.user.RegisterRequestDto;
import br.com.virtualmimic.api.models.user.User;
import br.com.virtualmimic.api.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDto dto) {

        User user = userService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "userId", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail()));
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginDto) {
        User user = userService.authenticate(loginDto);
        if (loginDto.getEmail() == null || loginDto.getPassword() == null || loginDto.getEmail().isBlank() || loginDto.getPassword().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email e senha são obrigatórios"));
        }
        return ResponseEntity.ok(Map.of(
                "userId", user.getUserId(),
                "name", user.getName(),
                "email", user.getEmail()));
    }
}
