package br.com.virtualmimic.api.service.user;

import br.com.virtualmimic.api.dto.request.user.RegisterRequestDto;
import br.com.virtualmimic.api.exception.EmailAlreadyExistsException;
import br.com.virtualmimic.api.exception.InvalidCredentialsException;
import br.com.virtualmimic.api.models.user.User;
import br.com.virtualmimic.api.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User register (RegisterRequestDto dto) {
        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new IllegalArgumentException("Senha e confirmação de senha não coincidem");
        }
        if (userRepository.existsByEmail(dto.getEmail().trim().toLowerCase())) {
            throw new EmailAlreadyExistsException("Já existe uma conta com este email");
        }

        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        return userRepository.save(user);
    }

    public User login (String email, String rawPassword) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new InvalidCredentialsException("Email ou senha inválidos"));

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException("Email ou senha inválidos");
        }
        return user;
    }
}
