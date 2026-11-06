import 'package:flutter/material.dart';
import '../models/models.dart';
import '../state/app_state.dart';
import '../theme/app_theme.dart';
import 'dvanille_brand.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;

  const ProductCard({super.key, required this.product, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final isFav = state.isFavorite(product.id);
    final precoExibido = product.emOferta
        ? product.precoOferta!
        : product.preco;

    return ListenableBuilder(
      listenable: state,
      builder: (context, _) {
        return GestureDetector(
          onTap: onTap,
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              border: Border.all(color: AppColors.beige.withValues(alpha: 0.6)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  children: [
                    Container(
                      height: 96,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: AppColors.beige.withValues(alpha: 0.35),
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(AppRadius.lg),
                        ),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        product.imagem,
                        style: const TextStyle(fontSize: 40),
                      ),
                    ),
                    Positioned(
                      top: 6,
                      right: 6,
                      child: GestureDetector(
                        onTap: () {
                          state.toggleFavorite(product.id);
                          showBrandSnackBar(
                            context,
                            isFav
                                ? 'Removido dos favoritos.'
                                : 'Adicionado aos favoritos.',
                            icon: Icons.favorite,
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(5),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                          ),
                          child: Icon(
                            isFav ? Icons.favorite : Icons.favorite_border,
                            size: 16,
                            color: AppColors.danger,
                          ),
                        ),
                      ),
                    ),
                    if (product.emOferta)
                      Positioned(
                        top: 6,
                        left: 6,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.brown,
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          child: const Text(
                            'OFERTA',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.nome,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 13.5,
                          color: AppColors.brownStrong,
                        ),
                      ),

                      // Quando estiver em oferta, mostra o preço original
                      // acima do preço promocional.
                      if (product.emOferta) ...[
                        const SizedBox(height: 4),
                        Text(
                          'R\$ ${product.preco.toStringAsFixed(2).replaceAll('.', ',')}',
                          style: const TextStyle(
                            fontSize: 10.5,
                            color: AppColors.textMuted,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],

                      const SizedBox(height: 3),

                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'R\$ ${precoExibido.toStringAsFixed(2).replaceAll('.', ',')}',
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                              color: AppColors.brownStrong,
                            ),
                          ),

                          GestureDetector(
                            onTap: () {
                              state.addToCart(product);
                              showBrandSnackBar(
                                context,
                                'Produto adicionado ao carrinho!',
                                icon: Icons.shopping_bag_outlined,
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.all(5),
                              decoration: const BoxDecoration(
                                color: AppColors.brown,
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.add,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class CategoryChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const CategoryChip({
    super.key,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? AppColors.brown : AppColors.white,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: Border.all(
            color: selected ? AppColors.brown : AppColors.beige,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : AppColors.brownStrong,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          ),
        ),
      ),
    );
  }
}

class RestrictionChip extends StatelessWidget {
  final String label;
  final VoidCallback? onRemove;
  const RestrictionChip({super.key, required this.label, this.onRemove});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.pink.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(AppRadius.pill),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(fontSize: 12, color: isDark ? AppColors.darkHighlight : AppColors.brownStrong),
          ),
          if (onRemove != null) ...[
            const SizedBox(width: 4),
            GestureDetector(
              onTap: onRemove,
              child: Icon(
                Icons.close,
                size: 14,
                color: isDark ? AppColors.darkText : AppColors.brownStrong,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class NutritionCard extends StatelessWidget {
  final String value;
  final String label;
  const NutritionCard({super.key, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: 84,
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.beige.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w700,
              color: isDark ? AppColors.darkText : AppColors.brownStrong,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: TextStyle(fontSize: 11, color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted),
          ),
        ],
      ),
    );
  }
}
