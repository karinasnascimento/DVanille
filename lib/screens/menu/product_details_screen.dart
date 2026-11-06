import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';
import '../../widgets/product_widgets.dart';

class ProductDetailsScreen extends StatefulWidget {
  final Product product;
  const ProductDetailsScreen({super.key, required this.product});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  int quantidade = 1;

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final p = widget.product;
    final preco = p.emOferta ? p.precoOferta! : p.preco;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: isDark ? AppColors.darkTextSecondary : AppColors.brownStrong),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          ListenableBuilder(
            listenable: state,
            builder: (context, _) {
              final isFav = state.isFavorite(p.id);
              return IconButton(
                icon: Icon(isFav ? Icons.favorite : Icons.favorite_border, color: AppColors.danger),
                onPressed: () {
                  state.toggleFavorite(p.id);
                  showBrandSnackBar(context, isFav ? 'Removido dos favoritos.' : 'Adicionado aos favoritos.');
                },
              );
            },
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              height: 200,
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkSurface : AppColors.beige.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(AppRadius.lg),
              ),
              alignment: Alignment.center,
              child: Text(p.imagem, style: const TextStyle(fontSize: 90)),
            ),
            const SizedBox(height: 18),
            Text(p.nome, style: Theme.of(context).textTheme.headlineSmall),
            const SizedBox(height: 6),
            Row(
              children: [
                Text('R\$ ${preco.toStringAsFixed(2).replaceAll('.', ',')}',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: isDark ? AppColors.darkText : AppColors.brownStrong)),
                if (p.emOferta) ...[
                  const SizedBox(width: 8),
                  Text('R\$ ${p.preco.toStringAsFixed(2).replaceAll('.', ',')}',
                      style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted, decoration: TextDecoration.lineThrough)),
                ],
                const Spacer(),
                Text(p.tamanho, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
            const SizedBox(height: 12),
            Text(p.descricao, style: Theme.of(context).textTheme.bodyMedium),
            const SectionTitle('Informações nutricionais'),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              children: [
                NutritionCard(value: '${p.nutricao.calorias} kcal', label: 'Calorias'),
                NutritionCard(value: '${p.nutricao.gorduraTotal.toStringAsFixed(0)} g', label: 'Gordura'),
                NutritionCard(value: '${p.nutricao.carboidratos.toStringAsFixed(0)} g', label: 'Carb.'),
                NutritionCard(value: '${p.nutricao.proteinas.toStringAsFixed(0)} g', label: 'Proteínas'),
                NutritionCard(value: '${p.nutricao.sodio.toStringAsFixed(0)} mg', label: 'Sódio'),
                NutritionCard(value: '${p.nutricao.gluten.toStringAsFixed(0)} g', label: 'Glúten'),
              ],
            ),
            const SectionTitle('Restrições / alergênicos'),
            p.restricoes.isEmpty
                ? Text(
                    'Nenhuma restrição cadastrada para este produto.',
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted,
                      fontSize: 13,
                    ),
                  )
                : Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: p.restricoes.map((r) => RestrictionChip(label: r.shortLabel)).toList(),
                  ),
            const SectionTitle('Ingredientes'),
            Text(
              p.ingredientes.isEmpty ? 'Ingredientes não cadastrados.' : p.ingredientes.join(', '),
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            const AllergenNotice(),
            const SizedBox(height: 20),
            Row(
              children: [
                Text('Quantidade', style: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.brownStrong, fontWeight: FontWeight.w600)),
                const Spacer(),
                _qtyButton(
                  Icons.remove,
                  () {
                    if (quantidade > 1) setState(() => quantidade--);
                  },
                  enabled: quantidade > 1,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text('$quantidade', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: isDark ? AppColors.darkText : AppColors.brownStrong)),
                ),
                _qtyButton(Icons.add, () => setState(() => quantidade++)),
              ],
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 10, 20, 16),
          child: ElevatedButton(
            onPressed: () {
              state.addToCart(p, quantidade: quantidade);
              showBrandSnackBar(context, 'Produto adicionado ao carrinho!', icon: Icons.shopping_bag_outlined);
            },
            child: const Text('ADICIONAR AO CARRINHO'),
          ),
        ),
      ),
    );
  }

  Widget _qtyButton(IconData icon, VoidCallback onTap, {bool enabled = true}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: enabled ? onTap : null,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isDark
              ? (enabled ? AppColors.darkButton : AppColors.darkSurface)
              : AppColors.beige.withValues(alpha: enabled ? 0.5 : 0.25),
          shape: BoxShape.circle,
          border: isDark && !enabled ? Border.all(color: AppColors.darkBorder) : null,
        ),
        child: Icon(
          icon,
          size: 18,
          color: isDark
              ? (enabled ? AppColors.darkBackground : AppColors.darkTextSecondary)
              : AppColors.brownStrong,
        ),
      ),
    );
  }
}
