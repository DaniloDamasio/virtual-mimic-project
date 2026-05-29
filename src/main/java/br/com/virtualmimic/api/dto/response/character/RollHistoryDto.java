package br.com.virtualmimic.api.dto.response.character;

import br.com.virtualmimic.api.models.character.RollHistory;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class RollHistoryDto {

    private Long id;
    private String label;
    private String notation;
    private List<Integer> rolls;
    private Integer total;
    private Instant rolledAt;

    public static RollHistoryDto fromEntity(RollHistory r) {
        RollHistoryDto dto = new RollHistoryDto();
        dto.setId(r.getId());
        dto.setLabel(r.getLabel());
        dto.setNotation(r.getNotation());
        dto.setRolls(r.getRolls());
        dto.setTotal(r.getTotal());
        dto.setRolledAt(r.getRolledAt());
        return dto;
    }
}
