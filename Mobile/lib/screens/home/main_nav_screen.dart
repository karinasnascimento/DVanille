import 'package:flutter/material.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import 'home_screen.dart';
import '../menu/menu_screen.dart';
import '../offers/offers_screen.dart';
import '../cart/cart_screen.dart';
import '../profile/profile_screen.dart';

/// Shell com navegação principal. Reutiliza uma única BottomNavigationBar
/// para não concorrer com nenhuma outra navegação inferior.
class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});
  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _index = 0;

  final _screens = const [
    HomeScreen(),
    MenuScreen(),
    OffersScreen(),
    CartScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      body: IndexedStack(index: _index, children: _screens),
      bottomNavigationBar: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          return NavigationBarTheme(
            data: NavigationBarThemeData(
              backgroundColor: isDark ? AppColors.darkSecondary : AppColors.white,
              indicatorColor: isDark ? AppColors.darkBorder : AppColors.pink.withValues(alpha: 0.5),
              iconTheme: WidgetStateProperty.resolveWith((states) => IconThemeData(
                color: isDark
                    ? (states.contains(WidgetState.selected) ? AppColors.darkHighlight : AppColors.darkTextSecondary)
                    : AppColors.brown,
              )),
              labelTextStyle: WidgetStateProperty.resolveWith((states) => TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.darkText : AppColors.brownStrong,
              )),
            ),
            child: NavigationBar(
              selectedIndex: _index,
              onDestinationSelected: (i) => setState(() => _index = i),
              destinations: [
                const NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Início'),
                const NavigationDestination(icon: Icon(Icons.menu_book_outlined), selectedIcon: Icon(Icons.menu_book), label: 'Cardápio'),
                const NavigationDestination(icon: Icon(Icons.local_offer_outlined), selectedIcon: Icon(Icons.local_offer), label: 'Ofertas'),
                NavigationDestination(
                  icon: Badge(
                    label: Text('${state.cartCount}'),
                    isLabelVisible: state.cartCount > 0,
                    backgroundColor: AppColors.brown,
                    child: const Icon(Icons.shopping_cart_outlined),
                  ),
                  selectedIcon: Badge(
                    label: Text('${state.cartCount}'),
                    isLabelVisible: state.cartCount > 0,
                    backgroundColor: AppColors.brown,
                    child: const Icon(Icons.shopping_cart),
                  ),
                  label: 'Carrinho',
                ),
                const NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: 'Perfil'),
              ],
            ),
          );
        },
      ),
    );
  }
}
