package br.com.virtualmimic.api.util;

import br.com.virtualmimic.api.models.character.CharacterModel;

public class CharacterModifiersCalculator {

    public static int getAbilityModifier(int abilityScore) {
        return Math.floorDiv(abilityScore - 10, 2);
    }

    public static int getProficiencyBonus(int level) {
        return ProficiencyBonusCalculator.forLevel(level);
    }

    public static int savingThrow(CharacterModel character, String abilityCode) {
        int abilityScore = switch (abilityCode) {
            case "STR" -> character.getStrength();
            case "DEX" -> character.getDexterity();
            case "CON" -> character.getConstitution();
            case "INT" -> character.getIntelligence();
            case "WIS" -> character.getWisdom();
            case "CHA" -> character.getCharisma();
            default -> throw new IllegalArgumentException("Habilidade inválida: " + abilityCode);
        };
        int modifier = getAbilityModifier(abilityScore);
        int profBonus = getProficiencyBonus(character.getCurrentLevel());
        boolean hasProficiency = character.getSavingThrowProficiencies() != null
                && character.getSavingThrowProficiencies().contains(abilityCode);
        return modifier + (hasProficiency ? profBonus : 0);
    }

    public static int skillBonus(int abilityScore, boolean proficient, boolean expertise, int level) {
        int mod = getAbilityModifier(abilityScore);
        int prof = getProficiencyBonus(level);

        if (expertise) return mod + (prof * 2);
        if (proficient) return mod + prof;
        return mod;
    }

    public static int armorClass(int dexterityScore, int armorBase, Integer shieldBonus) {
        int dexMod = getAbilityModifier(dexterityScore);
        int shield = shieldBonus != null ? shieldBonus : 0;
        return armorBase + dexMod + shield;
    }

    public static int passivePerception(int wisdomScore, boolean proficient, int level) {
        int perceptionBonus = skillBonus(wisdomScore, proficient, false, level);
        return 10 + perceptionBonus;
    }

    public static int spellSaveDC(int abilityScore, int level) {
        int mod = getAbilityModifier(abilityScore);
        int prof = getProficiencyBonus(level);
        return 8 + prof + mod;
    }
}
