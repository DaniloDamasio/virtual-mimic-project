package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FeatRequestDto {

    @NotBlank
    @Size(max = 200)
    private String name;

    @Size(max = 30)
    private String category;

    @Size(max = 30)
    private String actionType;

    @Size(max = 100)
    private String cost;

    @Size(max = 5000)
    private String description;
}
