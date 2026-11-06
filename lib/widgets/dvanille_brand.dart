import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class DVanilleLogo extends StatelessWidget {
  final double height;
  const DVanilleLogo({super.key, this.height = 64});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/logo.3.png',
      height: height,
      fit: BoxFit.contain,
      width: 170,
      errorBuilder: (_, __, ___) => Text(
        "D'Vanille",
        style: TextStyle(
          fontFamily: 'serif',
          fontSize: height * 0.4,
          fontWeight: FontWeight.w600,
          color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkText
                  : AppColors.brownStrong,
        ),
      ),
    );
  }
}

class DVanilleMark extends StatelessWidget {
  final double size;
  const DVanilleMark({super.key, this.size = 34});

  @override
  Widget build(BuildContext context) {
    return ClipOval(
      child: Image.asset(
        'assets/1.png',
        width: size,
        height: size,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => CircleAvatar(
          radius: size / 2,
          backgroundColor: AppColors.pink,
          child: Icon(Icons.local_florist, color: AppColors.brownStrong, size: size * 0.55),
        ),
      ),
    );
  }
}

class BowDecoration extends StatelessWidget {
  final double size;
  const BowDecoration({super.key, this.size = 46});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/lacinho.png',
      height: size,
      fit: BoxFit.contain,
      errorBuilder: (_, __, ___) => Icon(Icons.favorite, color: AppColors.pink, size: size * 0.6),
    );
  }
}

class DVanilleHeader extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final bool showBack;
  final bool showMark;
  final List<Widget>? actions;
  final bool showDrawerButton;

  const DVanilleHeader({
    super.key,
    this.title,
    this.showBack = false,
    this.showMark = false,
    this.actions,
    this.showDrawerButton = false,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      leading: showBack
          ? IconButton(
              icon: Icon(Icons.arrow_back, color: Theme.of(context).colorScheme.onSurface),
              onPressed: () => Navigator.of(context).pop(),
            )
          : (showDrawerButton
              ? Builder(
                  builder: (ctx) => IconButton(
                    icon: Icon(Icons.menu, color: Theme.of(context).colorScheme.onSurface),
                    onPressed: () => Scaffold.of(ctx).openDrawer(),
                  ),
                )
              : null),
              title: title == null
              ? const DVanilleLogo(height: 70)
              : Text(
                title!,
                style: const TextStyle(
                  fontFamily: 'CreamCake',
                  fontSize: 40,
                  color: AppColors.danger,
                ),
              ),
      actions: [
        ...?actions,
        if (showMark)
          const Padding(
            padding: EdgeInsets.only(right: 14),
            child: DVanilleMark(size: 30),
          ),
      ],
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}

class DVanilleCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  const DVanilleCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Material(
      color: isDark ? AppColors.darkSurface : AppColors.white,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: onTap,
        child: Container(
          padding: padding,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.beige.withValues(alpha: 0.6)),
          ),
          child: child,
        ),
      ),
    );
  }
}

void showBrandSnackBar(BuildContext context, String message, {IconData? icon}) {
  ScaffoldMessenger.of(context).hideCurrentSnackBar();
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: AppColors.pink, size: 18),
            const SizedBox(width: 8),
          ],
          Expanded(child: Text(message)),
        ],
      ),
    ),
  );
}

class SectionTitle extends StatelessWidget {
  final String text;
  final Widget? trailing;
  const SectionTitle(this.text, {super.key, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 18, bottom: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            text.toUpperCase(),
            style: TextStyle(
              fontWeight: FontWeight.w700,
              letterSpacing: 1.1,
              fontSize: 13,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkText
                  : AppColors.brownStrong,
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String? subtitle;
  final String? buttonLabel;
  final VoidCallback? onButtonTap;

  const EmptyState({
    super.key,
    required this.icon,
    required this.message,
    this.subtitle,
    this.buttonLabel,
    this.onButtonTap,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 56, color: Theme.of(context).colorScheme.secondary),
            const SizedBox(height: 16),
            Text(
              message,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 6),
              Text(
                subtitle!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
            if (buttonLabel != null) ...[
              const SizedBox(height: 20),
              OutlinedButton(
                onPressed: onButtonTap,
                child: Text(buttonLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class AllergenNotice extends StatelessWidget {
  const AllergenNotice({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSecondary : AppColors.pink.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(AppRadius.md),
        border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.pink),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(Icons.warning_amber_rounded, color: isDark ? AppColors.darkHighlight : AppColors.brownStrong, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'As informações de ingredientes e alergênicos são baseadas nos dados '
              'cadastrados para o produto. Em caso de alergia ou restrição, confirme '
              'as informações antes do consumo.',
              style: TextStyle(fontSize: 12.5, color: isDark ? AppColors.darkText : AppColors.brownStrong, height: 1.4),
            ),
          ),
        ],
      ),
    );
  }
}
