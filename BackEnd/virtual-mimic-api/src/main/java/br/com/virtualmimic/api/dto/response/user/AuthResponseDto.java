package br.com.virtualmimic.api.dto.response.user;

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
}
