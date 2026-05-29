package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SpellRequestDto {

    @Size(max = 100)
    private String slug;

    @NotBlank
    @Size(max = 200)
    private String name;

    private Integer level;

    @Size(max = 100)
    private String school;

    @Size(max = 100)
    private String castingTime;

    @Size(max = 100)
    private String range;

    @Size(max = 100)
    private String components;

    @Size(max = 100)
    private String duration;

    @Size(max = 5000)
    private String description;
}
