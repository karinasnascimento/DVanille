import 'package:flutter/material.dart';
import '../../state/app_state.dart';
import '../../widgets/dvanille_brand.dart';
import '../../widgets/product_widgets.dart';
import '../menu/product_details_screen.dart';

class FavoritesScreen extends StatelessWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Favoritos', showBack: true),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final favs = state.favoriteProducts;
          if (favs.isEmpty) {
            return EmptyState(
              icon: Icons.favorite_border,
              message: 'Você ainda não possui favoritos.',
              buttonLabel: 'EXPLORAR CARDÁPIO',
              onButtonTap: () => Navigator.pushNamed(context, '/cardapio'),
            );
          }
          return Padding(
            padding: const EdgeInsets.all(18),
            child: GridView.builder(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 14,
                crossAxisSpacing: 14,
                childAspectRatio: 0.68,
              ),
              itemCount: favs.length,
              itemBuilder: (context, i) {
                final p = favs[i];
                return ProductCard(
                  product: p,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ProductDetailsScreen(product: p)),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
