import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

class RestrictionsScreen extends StatefulWidget {
  const RestrictionsScreen({super.key});

  @override
  State<RestrictionsScreen> createState() => _RestrictionsScreenState();
}

class _RestrictionsScreenState extends State<RestrictionsScreen> {
  late Set<DietaryRestriction> selected;

  @override
  void initState() {
    super.initState();
    selected = {...AppState.instance.user.restricoes};
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;

    return Scaffold(
      appBar: const DVanilleHeader(title: 'Minhas restrições', showBack: true),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
            child: Align(
              alignment: Alignment.centerLeft,
              child: Text(
                'Selecione suas condições:',
                style: TextStyle(color: primaryText, fontSize: 14),
              ),
            ),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              children: DietaryRestriction.values
                  .map(
                    (r) => CheckboxListTile(
                      value: selected.contains(r),
                      title: Text(
                        r.label,
                        style: TextStyle(fontSize: 13.5, color: primaryText),
                      ),
                      activeColor: AppColors.brown,
                      controlAffinity: ListTileControlAffinity.leading,
                      contentPadding: EdgeInsets.zero,
                      onChanged: (v) => setState(() {
                        if (v == true) {
                          selected.add(r);
                        } else {
                          selected.remove(r);
                        }
                      }),
                    ),
                  )
                  .toList(),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
            child: Column(
              children: [
                ElevatedButton(
                  onPressed: () {
                    AppState.instance.updateUserRestrictions(selected);
                    showBrandSnackBar(
                      context,
                      'Preferências salvas com sucesso!',
                    );
                    Navigator.pop(context);
                  },
                  child: const Text('SALVAR PREFERÊNCIAS'),
                ),
                const SizedBox(height: 10),
                OutlinedButton(
                  onPressed: () {
                    AppState.instance.updateUserRestrictions(selected);
                    Navigator.pushNamed(context, '/cardapio');
                  },
                  child: const Text('FILTRAR CARDÁPIO PELAS MINHAS RESTRIÇÕES'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      AppState.instance.markAllNotificationsRead();
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;

    return Scaffold(
      appBar: const DVanilleHeader(title: 'Notificações', showBack: true),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          if (state.notifications.isEmpty) {
            return const EmptyState(
              icon: Icons.notifications_none,
              message: 'Nenhuma notificação por aqui.',
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(18),
            itemCount: state.notifications.length,
            separatorBuilder: (_, __) => const Divider(),
            itemBuilder: (context, i) {
              final n = state.notifications[i];

              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: Icon(
                  n.icone,
                  color: Theme.of(context).colorScheme.primary,
                  size: 26,
                ),
                title: Text(
                  n.titulo,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  n.mensagem,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Configurações', showBack: true),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 10),
            child: Text(
              'ACESSIBILIDADE',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: Theme.of(context).brightness == Brightness.dark
                    ? AppColors.darkHighlight
                    : AppColors.brownStrong,
                letterSpacing: 0.6,
              ),
            ),
          ),
          ListenableBuilder(
            listenable: AppState.instance,
            builder: (context, _) {
              final isDark = Theme.of(context).brightness == Brightness.dark;
              final darkMode = AppState.instance.isDarkMode;

              return SwitchListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 12),
                secondary: Icon(
                  darkMode
                      ? Icons.dark_mode_outlined
                      : Icons.light_mode_outlined,
                  color: isDark
                      ? AppColors.darkTextSecondary
                      : AppColors.brownStrong,
                ),
                title: Text(
                  'Modo escuro',
                  style: TextStyle(
                    color: isDark ? AppColors.darkText : AppColors.brownStrong,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  'Ativar a aparência escura do aplicativo',
                  style: TextStyle(
                    color: isDark
                        ? AppColors.darkTextSecondary
                        : AppColors.brown,
                  ),
                ),
                value: darkMode,
                onChanged: AppState.instance.setDarkMode,
              );
            },
          ),
          const Divider(height: 28),
          _tile(
            context,
            Icons.notifications_rounded,
            'Notificações',
            () => Navigator.pushNamed(context, '/notificacoes'),
          ),
          _tile(
            context,
            Icons.restaurant_menu_rounded,
            'Preferências alimentares',
            () => Navigator.pushNamed(context, '/restricoes'),
          ),
          _tile(
            context,
            Icons.location_on_rounded,
            'Endereços',
            () => Navigator.pushNamed(context, '/enderecos'),
          ),
          const Divider(height: 30),
          _tile(
            context,
            Icons.logout,
            'Sair da conta',
            () {
              AppState.instance.logout();
              Navigator.pushNamedAndRemoveUntil(
                context,
                '/login',
                (r) => false,
              );
            },
            color: AppColors.danger,
            showTrailing: false,
            bold: true,
          ),
        ],
      ),
    );
  }

  Widget _tile(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onTap, {
    Color? color,
    bool showTrailing = true,
    bool bold = false,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final c = color ?? (isDark ? AppColors.darkText : AppColors.brownStrong);

    return ListTile(
      leading: Icon(icon, color: c),
      title: Text(
        label,
        style: TextStyle(
          color: c,
          fontWeight: bold ? FontWeight.bold : FontWeight.w500,
        ),
      ),
      trailing: showTrailing
          ? Icon(
              Icons.chevron_right,
              color: isDark ? AppColors.darkTextSecondary : AppColors.brown,
            )
          : null,
      onTap: onTap,
    );
  }
}
