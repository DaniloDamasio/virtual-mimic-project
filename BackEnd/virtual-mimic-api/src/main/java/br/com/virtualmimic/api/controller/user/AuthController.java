package br.com.virtualmimic.api.controller.user;

import br.com.virtualmimic.api.dto.request.user.LoginRequestDto;
import br.com.virtualmimic.api.dto.request.user.RegisterRequestDto;
import br.com.virtualmimic.api.dto.response.user.AuthResponseDto;
import br.com.virtualmimic.api.models.user.User;
import br.com.virtualmimic.api.security.JwtTokenProvider;
import br.com.virtualmimic.api.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto dto) {
        User user = userService.register(dto);
        String token = jwtTokenProvider.generateToken(user.getUserId(), user.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponseDto(token, user.getUserId(), user.getName(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto loginDto) {
        User user = userService.authenticate(loginDto);
        String token = jwtTokenProvider.generateToken(user.getUserId(), user.getEmail());

        return ResponseEntity.ok(new AuthResponseDto(token, user.getUserId(), user.getName(), user.getEmail()));
    }
}
