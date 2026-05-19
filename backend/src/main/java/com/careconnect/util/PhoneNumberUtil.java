package com.careconnect.util;

public final class PhoneNumberUtil {

    private PhoneNumberUtil() {
    }

    /**
     * Normalize to E.164-like format.
     * Rules:
     * - Empty/null => null
     * - Strip spaces, dashes, and parentheses
     * - If starts with "+", keep country code as provided
     * - If only 10 digits, default to India (+91)
     * - If 12 digits and starts with "91", prefix "+"
     * Returns null when invalid.
     */
    public static String normalizeToE164OrNull(String raw) {
        if (raw == null) {
            return null;
        }

        String cleaned = raw.trim()
                .replace(" ", "")
                .replace("-", "")
                .replace("(", "")
                .replace(")", "");

        if (cleaned.isBlank()) {
            return null;
        }

        if (cleaned.startsWith("+")) {
            return isValidE164(cleaned) ? cleaned : null;
        }

        if (cleaned.matches("\\d{10}")) {
            return "+91" + cleaned;
        }

        if (cleaned.matches("91\\d{10}")) {
            return "+" + cleaned;
        }

        return null;
    }

    public static boolean isValidE164(String phone) {
        return phone != null && phone.matches("^\\+[1-9]\\d{9,14}$");
    }
}

