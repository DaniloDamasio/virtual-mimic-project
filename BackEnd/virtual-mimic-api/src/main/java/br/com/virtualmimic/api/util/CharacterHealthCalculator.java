package br.com.virtualmimic.api.util;

public class CharacterHealthCalculator {

    public static int calculateBaseMaxHealth(int level, int hpFirstLevel, int hpSubsequentLevels, int constitutionScore) {

        if (level <= 0) {
            return 0;
        }

        int conMod = CharacterModifiersCalculator.getAbilityModifier(constitutionScore);
        int maxHealth = hpFirstLevel + conMod;

        if (level > 1) {
            int extraLevels = level - 1;
            maxHealth += extraLevels * (hpSubsequentLevels + conMod);
        }

        return Math.max(maxHealth, 1);
    }
}
