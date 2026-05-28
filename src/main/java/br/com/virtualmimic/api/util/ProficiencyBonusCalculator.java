package br.com.virtualmimic.api.util;

public class ProficiencyBonusCalculator {

    public static int forLevel(int level) {
        if (level <= 0) return 2;
        if (level <= 4) return 2;
        if (level <= 8) return 3;
        if (level <= 12) return 4;
        if (level <= 16) return 5;
        return 6;
    }
}
