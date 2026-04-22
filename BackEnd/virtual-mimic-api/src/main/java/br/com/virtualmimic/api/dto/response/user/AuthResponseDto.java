package br.com.virtualmimic.api.dto.response.user;

import br.com.virtualmimic.api.models.user.User;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class AuthResponseDto {
    private String token;
    private UUID userId;
    private String name;
    private String email;

    public static AuthResponseDto from(User user, String token) {
        return new AuthResponseDto(token, user.getUserId(), user.getName(), user.getEmail());
    }
}
