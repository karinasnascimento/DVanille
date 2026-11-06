import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';
import '../../widgets/product_widgets.dart';
import '../menu/product_details_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: DVanilleHeader(
        showDrawerButton: true,
        actions: [
          IconButton(
            icon: Icon(
              Icons.notifications_none,
              color: isDark ? AppColors.darkHighlight : AppColors.brownStrong,
            ),
            onPressed: () => Navigator.pushNamed(context, '/notificacoes'),
          ),
        ],
      ),
      drawer: const _HomeDrawer(),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final populares = state.products.where((p) => p.popular).toList();
          final outros = state.products;
          final ofertas = state.products.where((p) => p.emOferta).toList();

          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 2),
                Text(
                  'Olá ${state.user.nome.split(' ').first}!',
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontFamily: 'CreamCake',
                    fontSize: 50,
                    color: isDark ? AppColors.darkHighlight : AppColors.danger,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Que tal um docinho hoje?',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/cardapio'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 14,
                    ),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.white,
                      borderRadius: BorderRadius.circular(AppRadius.pill),
                      border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.beige),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.search,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted,
                          size: 20,
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'O que você procura?',
                          style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ),
                const SectionTitle('Categorias'),
                SizedBox(
                  height: 44,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: ProductCategory.values.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 10),
                    itemBuilder: (context, i) {
                      final cat = ProductCategory.values[i];
                      return CategoryChip(
                        label: cat.label,
                        selected: false,
                        onTap: () => Navigator.pushNamed(
                          context,
                          '/cardapio',
                          arguments: cat,
                        ),
                      );
                    },
                  ),
                ),
                const SectionTitle('Populares'),
                SizedBox(
                  height: 190,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: populares.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, i) {
                      final p = populares[i];
                      return SizedBox(
                        width: 140,
                        child: ProductCard(
                          product: p,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailsScreen(product: p),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SectionTitle('Mais produtos'),
                SizedBox(
                  height: 190,
                  child: ListView.separated(
                    scrollDirection: Axis.horizontal,
                    itemCount: outros.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, i) {
                      final p = outros[i];
                      return SizedBox(
                        width: 140,
                        child: ProductCard(
                          product: p,
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => ProductDetailsScreen(product: p),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SectionTitle('Ofertas'),
                GestureDetector(
                  onTap: () => Navigator.pushNamed(context, '/ofertas'),
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurface : AppColors.pink.withValues(alpha: 0.45),
                      borderRadius: BorderRadius.circular(AppRadius.lg),
                    ),
                    child: Column(
                      children: [
                        const Text('🎁', style: TextStyle(fontSize: 30)),
                        const SizedBox(height: 6),
                        Text(
                          ofertas.isEmpty
                              ? 'Confira nossas ofertas especiais'
                              : '${ofertas.length} produtos em oferta especial',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: isDark ? AppColors.darkText : AppColors.brownStrong,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                const Center(child: BowDecoration()),
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _HomeDrawer extends StatelessWidget {
  const _HomeDrawer();

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Drawer(
      backgroundColor: isDark ? AppColors.darkSecondary : AppColors.cream,
      child: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 3),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 20),
                child: DVanilleLogo(height: 100),
              ),
              const SizedBox(height: 0.1),
              Divider(color: isDark ? AppColors.darkBorder : AppColors.beige),
              _drawerItem(
                context,
                Icons.home_outlined,
                'Início',
                () => Navigator.pop(context),
              ),
              _drawerItem(context, Icons.local_cafe_outlined, 'Conheça', () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/conheca');
              }),
              _drawerItem(context, Icons.mail_outline, 'Contato', () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/contato');
              }),
              _drawerItem(context, Icons.favorite_border, 'Favoritos', () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/favoritos');
              }),
              _drawerItem(
                context,
                Icons.receipt_long_outlined,
                'Meus pedidos',
                () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/pedidos');
                },
              ),
              _drawerItem(
                context,
                Icons.card_giftcard_outlined,
                'Vale-presente',
                () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/ofertas');
                },
              ),
              _drawerItem(
                context,
                Icons.settings_outlined,
                'Configurações',
                () {
                  Navigator.pop(context);
                  Navigator.pushNamed(context, '/configuracoes');
                },
              ),
              if (state.isAdmin)
                _drawerItem(
                  context,
                  Icons.admin_panel_settings_outlined,
                  'Área administrativa',
                  () {
                    Navigator.pop(context);
                    Navigator.pushNamed(context, '/admin');
                  },
                ),
              const SizedBox(height: 20),
              _drawerItem(context, Icons.logout, 'Sair', () {
                state.logout();
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/login',
                  (r) => false,
                );
              }),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _drawerItem(
    BuildContext context,
    IconData icon,
    String label,
    VoidCallback onTap,
  ) {
    return ListTile(
      leading: Icon(icon, color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.brownStrong),
      title: Text(
        label,
        style: TextStyle(
          color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong,
          fontWeight: FontWeight.w500,
        ),
      ),
      onTap: onTap,
    );
  }
}
