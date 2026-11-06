import 'package:flutter/material.dart';

/// Paleta oficial D'Vanille — preservar em todas as telas.
class AppColors {
  static const Color brown = Color(0xFF9C8A73);
  static const Color brownStrong = Color(0xFF7D6D57);
  static const Color pink = Color(0xFFEFCECC);
  static const Color cream = Color(0xFFFFF4E8);
  static const Color beige = Color(0xFFE1CDB3);

  static const Color white = Color(0xFFFFFFFF);
  static const Color success = Color(0xFF7C9A72);
  static const Color warning = Color(0xFFC98A4B);
  static const Color danger = Color(0xFFC98F8C);
  static const Color textMuted = Color(0xFFA6957E);

  // Paleta oficial do modo escuro
  static const Color darkBackground = Color(0xFF241F1B);
  static const Color darkSecondary = Color(0xFF332B26);
  static const Color darkSurface = Color(0xFF3A322C);
  static const Color darkText = Color(0xFFFFF4E8);
  static const Color darkTextSecondary = Color(0xFFD9C6AF);
  static const Color darkHighlight = Color(0xFFE6A9A5);
  static const Color darkButton = Color(0xFFB99F82);
  static const Color darkBorder = Color(0xFF55483D);
}

class AppRadius {
  static const double sm = 10;
  static const double md = 16;
  static const double lg = 22;
  static const double pill = 999;
}

class AppTheme {
  static ThemeData get theme {
    final base = ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: AppColors.cream,
      primaryColor: AppColors.brown,
      colorScheme: ColorScheme.fromSeed(
        seedColor: AppColors.brown,
        primary: AppColors.brown,
        secondary: AppColors.pink,
        surface: AppColors.cream,
        error: AppColors.danger,
      ),
      fontFamily: 'serif',
    );

    return base.copyWith(
      textTheme: base.textTheme.copyWith(
        headlineSmall: const TextStyle(
          fontFamily: 'serif',
          fontWeight: FontWeight.w600,
          color: AppColors.brownStrong,
          fontSize: 22,
        ),
        titleLarge: const TextStyle(
          fontFamily: 'serif',
          fontWeight: FontWeight.w600,
          color: AppColors.brownStrong,
          fontSize: 18,
        ),
        titleMedium: const TextStyle(
          fontFamily: 'serif',
          fontWeight: FontWeight.w600,
          color: AppColors.brownStrong,
          fontSize: 16,
        ),
        bodyLarge: const TextStyle(color: AppColors.brownStrong, fontSize: 15),
        bodyMedium: const TextStyle(color: AppColors.brown, fontSize: 14),
        bodySmall: const TextStyle(color: AppColors.textMuted, fontSize: 12),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.cream,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.brownStrong,
        centerTitle: true,
        titleTextStyle: TextStyle(
          fontFamily: 'serif',
          fontWeight: FontWeight.w600,
          color: AppColors.brownStrong,
          fontSize: 19,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.brown,
          foregroundColor: AppColors.white,
          minimumSize: const Size.fromHeight(52),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.4,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.brownStrong,
          minimumSize: const Size.fromHeight(52),
          side: const BorderSide(color: AppColors.beige, width: 1.3),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.pill),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: AppColors.brownStrong),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.white,
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.beige),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.beige),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.brown, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
      ),
      cardTheme: CardThemeData(
        color: AppColors.beige.withValues(alpha: 0.35),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.lg),
        ),
      ),
      dividerTheme: const DividerThemeData(color: AppColors.beige, thickness: 1),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.brownStrong,
        contentTextStyle: const TextStyle(color: AppColors.white),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.sm),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.darkButton,
      brightness: Brightness.dark,
      primary: AppColors.darkButton,
      onPrimary: AppColors.darkBackground,
      secondary: AppColors.darkHighlight,
      surface: AppColors.darkSurface,
      onSurface: AppColors.darkText,
      error: AppColors.danger,
    );
    final base = ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.darkBackground,
      primaryColor: AppColors.darkButton,
      fontFamily: 'serif',
    );

    return base.copyWith(
      textTheme: base.textTheme.copyWith(
        headlineSmall: const TextStyle(fontFamily: 'serif', fontWeight: FontWeight.w600, color: AppColors.darkHighlight, fontSize: 22),
        titleLarge: const TextStyle(fontFamily: 'serif', fontWeight: FontWeight.w600, color: AppColors.darkText, fontSize: 18),
        titleMedium: const TextStyle(fontFamily: 'serif', fontWeight: FontWeight.w600, color: AppColors.darkText, fontSize: 16),
        bodyLarge: const TextStyle(color: AppColors.darkText, fontSize: 15),
        bodyMedium: const TextStyle(color: AppColors.darkTextSecondary, fontSize: 14),
        bodySmall: const TextStyle(color: AppColors.darkTextSecondary, fontSize: 12),
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        surfaceTintColor: Colors.transparent,
        foregroundColor: AppColors.darkText,
        centerTitle: true,
        titleTextStyle: TextStyle(fontFamily: 'serif', fontWeight: FontWeight.w600, color: AppColors.darkText, fontSize: 19),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.darkButton,
          foregroundColor: AppColors.darkBackground,
          minimumSize: const Size.fromHeight(52),
          textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600, letterSpacing: 0.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.pill)),
          elevation: 0,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.darkText,
          minimumSize: const Size.fromHeight(52),
          side: const BorderSide(color: AppColors.darkBorder, width: 1.3),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.pill)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(style: TextButton.styleFrom(foregroundColor: AppColors.darkHighlight)),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkSecondary,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: const TextStyle(color: AppColors.darkTextSecondary, fontSize: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: const BorderSide(color: AppColors.darkBorder)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: const BorderSide(color: AppColors.darkBorder)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: const BorderSide(color: AppColors.darkButton, width: 1.6)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: const BorderSide(color: AppColors.danger)),
      ),
      cardTheme: CardThemeData(color: AppColors.darkSurface, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.lg))),
      dividerTheme: const DividerThemeData(color: AppColors.darkBorder, thickness: 1),
      snackBarTheme: SnackBarThemeData(
        backgroundColor: AppColors.darkSurface,
        contentTextStyle: const TextStyle(color: AppColors.darkText),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppRadius.sm)),
      ),
      listTileTheme: const ListTileThemeData(iconColor: AppColors.darkTextSecondary, textColor: AppColors.darkText),
      checkboxTheme: CheckboxThemeData(fillColor: WidgetStateProperty.resolveWith((states) => states.contains(WidgetState.selected) ? AppColors.darkButton : null), checkColor: WidgetStateProperty.all(AppColors.darkBackground)),
      switchTheme: SwitchThemeData(thumbColor: WidgetStateProperty.resolveWith((states) => states.contains(WidgetState.selected) ? AppColors.darkButton : AppColors.darkTextSecondary), trackColor: WidgetStateProperty.resolveWith((states) => states.contains(WidgetState.selected) ? AppColors.darkSecondary : AppColors.darkBorder)),
    );
  }

}
