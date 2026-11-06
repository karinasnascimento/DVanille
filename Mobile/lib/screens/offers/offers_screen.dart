import 'package:flutter/material.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';
import '../../widgets/product_widgets.dart';
import '../menu/product_details_screen.dart';

class OffersScreen extends StatelessWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Ofertas'),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final ofertas = state.products.where((p) => p.emOferta).toList();
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
          final secondaryText = isDark ? AppColors.darkTextSecondary : AppColors.textMuted;
          final giftSurface = isDark ? AppColors.darkSurface : AppColors.beige.withValues(alpha: 0.4);
          return SingleChildScrollView(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle('Ofertas especiais'),
                if (ofertas.isEmpty)
                  const EmptyState(icon: Icons.local_offer_outlined, message: 'No momento não há ofertas disponíveis.')
                else
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 14,
                      crossAxisSpacing: 14,
                      childAspectRatio: 0.68,
                    ),
                    itemCount: ofertas.length,
                    itemBuilder: (context, i) {
                      final p = ofertas[i];
                      return ProductCard(
                        product: p,
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => ProductDetailsScreen(product: p)),
                        ),
                      );
                    },
                  ),
                const SectionTitle('Vale-presente'),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: giftSurface,
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    border: Border.all(color: isDark ? AppColors.darkBorder : AppColors.beige),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Presenteie alguém com D\'Vanille',
                          style: TextStyle(fontWeight: FontWeight.w600, color: primaryText, fontSize: 15)),
                      const SizedBox(height: 5),
                      Text('Um carinho especial para adoçar o dia de alguém.',
                          style: TextStyle(fontSize: 13, color: secondaryText, height: 1.4)),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () => Navigator.pushNamed(context, '/vale-presente'),
                        child: const Text('COMPRAR VALE-PRESENTE'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: () => Navigator.pushNamed(context, '/meus-vales'),
                    child: const Text('MEUS VALES-PRESENTE'),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          );
        },
      ),
    );
  }
}

class GiftCardScreen extends StatefulWidget {
  const GiftCardScreen({super.key});
  @override
  State<GiftCardScreen> createState() => _GiftCardScreenState();
}

class _GiftCardScreenState extends State<GiftCardScreen> {
  double? selected = 50;
  final _customCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    const valores = [30.0, 50.0, 100.0, 150.0];
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Vale-presente', showBack: true),
      body: Builder(
        builder: (context) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
          final secondaryText = isDark ? AppColors.darkTextSecondary : AppColors.textMuted;
          final optionSurface = isDark ? AppColors.darkSurface : AppColors.white;
          return Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Escolha o valor', style: TextStyle(fontWeight: FontWeight.w600, color: primaryText)),
            const SizedBox(height: 14),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: valores.map((v) {
                final sel = selected == v;
                return GestureDetector(
                  onTap: () => setState(() {
                    selected = v;
                    _customCtrl.clear();
                  }),
                  child: Container(
                    width: 80,
                    height: 60,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: sel ? (isDark ? AppColors.darkButton : AppColors.brown) : optionSurface,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: sel ? (isDark ? AppColors.darkButton : AppColors.brown) : (isDark ? AppColors.darkBorder : AppColors.beige)),
                    ),
                    child: Text('R\$${v.toStringAsFixed(0)}',
                        style: TextStyle(color: sel ? (isDark ? AppColors.darkBackground : Colors.white) : primaryText, fontWeight: FontWeight.w700)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 18),
            TextField(
              controller: _customCtrl,
              keyboardType: TextInputType.number,
              onChanged: (v) => setState(() => selected = double.tryParse(v)),
              style: TextStyle(color: primaryText),
              decoration: InputDecoration(
                hintText: 'Valor personalizado (R\$)',
                hintStyle: TextStyle(color: secondaryText),
                filled: true,
                fillColor: optionSurface,
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: BorderSide(color: isDark ? AppColors.darkBorder : AppColors.beige)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.md), borderSide: BorderSide(color: isDark ? AppColors.darkButton : AppColors.brown, width: 1.5)),
              ),
            ),
            const Spacer(),
            ElevatedButton(
              onPressed: selected == null || selected! <= 0
                  ? null
                  : () {
                      final card = AppState.instance.buyGiftCard(selected!);
                      showBrandSnackBar(context, 'Vale-presente criado com sucesso!', icon: Icons.card_giftcard);
                      showDialog(
                        context: context,
                        builder: (_) => AlertDialog(
                          backgroundColor: isDark ? AppColors.darkSecondary : AppColors.cream,
                          title: Text('Vale-presente gerado', style: TextStyle(color: primaryText)),
                          content: Column(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Seu presente está pronto!', style: TextStyle(color: secondaryText)),
                              const SizedBox(height: 10),
                              Text('Valor: R\$ ${card.valor.toStringAsFixed(2)}', style: TextStyle(color: primaryText)),
                              Text('Código: ${card.codigo}', style: TextStyle(color: primaryText)),
                              Text('Validade: ${card.validade.day}/${card.validade.month}/${card.validade.year}', style: TextStyle(color: primaryText)),
                            ],
                          ),
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.pop(context);
                                Navigator.pop(context);
                              },
                              child: Text('OK', style: TextStyle(color: isDark ? AppColors.darkHighlight : AppColors.brownStrong)),
                            ),
                          ],
                        ),
                      );
                    },
              child: const Text('COMPRAR VALE-PRESENTE'),
            ),
          ],
        ),
      );
        },
      ),
    );
  }
}

class MyGiftCardsScreen extends StatelessWidget {
  const MyGiftCardsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Meus vales-presente', showBack: true),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
          final secondaryText = isDark ? AppColors.darkTextSecondary : AppColors.textMuted;
          if (state.giftCards.isEmpty) {
            return const EmptyState(icon: Icons.card_giftcard_outlined, message: 'Você ainda não possui vales-presente.');
          }
          return ListView.separated(
            padding: const EdgeInsets.all(18),
            itemCount: state.giftCards.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              final g = state.giftCards[i];
              return DVanilleCard(
                child: Row(
                  children: [
                    Icon(Icons.card_giftcard, color: isDark ? AppColors.darkHighlight : AppColors.brown),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('R\$ ${g.valor.toStringAsFixed(2)}',
                              style: TextStyle(fontWeight: FontWeight.w700, color: primaryText)),
                          Text(g.codigo, style: TextStyle(fontSize: 12, color: secondaryText)),
                          Text('Válido até ${g.validade.day}/${g.validade.month}/${g.validade.year}',
                              style: TextStyle(fontSize: 11, color: secondaryText)),
                        ],
                      ),
                    ),
                    Text(g.usado ? 'Usado' : 'Ativo',
                        style: TextStyle(color: g.usado ? AppColors.textMuted : AppColors.success, fontWeight: FontWeight.w600)),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
