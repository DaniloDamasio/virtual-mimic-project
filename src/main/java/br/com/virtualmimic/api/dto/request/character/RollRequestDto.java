package br.com.virtualmimic.api.dto.request.character;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class RollRequestDto {

    @NotBlank
    @Size(max = 100)
    private String label;

    @NotBlank
    @Size(max = 50)
    private String notation;

    @NotNull
    private List<Integer> rolls;

    @NotNull
    private Integer total;
}
