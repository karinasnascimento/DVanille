
import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';
import '../../widgets/product_widgets.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Carrinho'),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          if (state.cartItems.isEmpty) {
            return _CartEmptyState(
              onButtonTap: () => Navigator.pushNamed(context, '/cardapio'),
            );
          }
          return Column(
            children: [
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(18),
                  itemCount: state.cartItems.length,
                  separatorBuilder: (_, __) => const Divider(height: 24),
                  itemBuilder: (context, i) {
                    final item = state.cartItems[i];
                    return Row(
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: isDark
                                ? AppColors.darkSurface
                                : AppColors.beige.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(AppRadius.sm),
                          ),
                          alignment: Alignment.center,
                          clipBehavior: Clip.antiAlias,
                          child: ProductImage(
                            source: item.produto.imagem,
                            width: 52,
                            height: 52,
                            fallbackFontSize: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.produto.nome,
                                style: TextStyle(
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? AppColors.darkText
                                      : AppColors.brownStrong,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'R\$ ${item.precoUnitario.toStringAsFixed(2).replaceAll('.', ',')}',
                                style: TextStyle(
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.textMuted,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Row(
                          children: [
                            _qtyBtn(
                              context,
                              Icons.remove,
                              () => state.decrementCartItem(item),
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 10),
                              child: Text(
                                '${item.quantidade}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            _qtyBtn(
                              context,
                              Icons.add,
                              () => state.incrementCartItem(item),
                            ),
                          ],
                        ),
                      ],
                    );
                  },
                ),
              ),
              _CartSummary(
                subtotal: state.cartSubtotal,
                taxa: state.taxaEntregaAtual,
                buttonLabel: 'CONTINUAR',
                onContinue: () =>
                    Navigator.pushNamed(context, '/revisar-pedido'),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _qtyBtn(BuildContext context, IconData icon, VoidCallback onTap) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(6),
        decoration: BoxDecoration(
          color: isDark
              ? AppColors.darkButton
              : AppColors.beige.withValues(alpha: 0.5),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: 15,
          color: isDark ? AppColors.darkBackground : AppColors.brownStrong,
        ),
      ),
    );
  }
}

class _CartEmptyState extends StatelessWidget {
  final VoidCallback onButtonTap;

  const _CartEmptyState({
    required this.onButtonTap,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'carrinho.png',
              width: 90,
              height: 90,
              fit: BoxFit.contain,
            ),
            const SizedBox(height: 16),
            Text(
              'Seu carrinho está vazio.',
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 20),
            OutlinedButton(
              onPressed: onButtonTap,
              child: const Text('VER CARDÁPIO'),
            ),
          ],
        ),
      ),
    );
  }
}

class _CartSummary extends StatelessWidget {
  final double subtotal;
  final double taxa;
  final String buttonLabel;
  final VoidCallback onContinue;

  const _CartSummary({
    required this.subtotal,
    required this.taxa,
    required this.buttonLabel,
    required this.onContinue,
  });

  @override
  Widget build(BuildContext context) {
    final total = subtotal + taxa;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSecondary : AppColors.white,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder : AppColors.beige,
            ),
          ),
        ),
        child: Column(
          children: [
            _row(context, 'Subtotal', subtotal),
            _row(context, 'Entrega', taxa),
            const Divider(),
            _row(context, 'TOTAL', total, bold: true),
            const SizedBox(height: 12),
            ElevatedButton(
              style: isDark
                  ? ElevatedButton.styleFrom(
                      foregroundColor: AppColors.cream,
                    )
                  : null,
              onPressed: onContinue,
              child: Text(buttonLabel),
            ),
          ],
        ),
      ),
    );
  }

  Widget _row(
    BuildContext context,
    String label,
    double value, {
    bool bold = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
              fontSize: bold ? 16 : 14,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkText
                  : AppColors.brownStrong,
            ),
          ),
          Text(
            'R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}',
            style: TextStyle(
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              fontSize: bold ? 16 : 14,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkText
                  : AppColors.brownStrong,
            ),
          ),
        ],
      ),
    );
  }
}

class ReviewOrderScreen extends StatelessWidget {
  const ReviewOrderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;

    return Scaffold(
      appBar: const DVanilleHeader(
        title: 'Revisar pedido',
        showBack: true,
      ),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final endereco =
              state.enderecoSelecionado ?? state.enderecoPrincipal;
          final isDark = Theme.of(context).brightness == Brightness.dark;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SectionTitle('Seus produtos'),
                ...state.cartItems.map(
                  (item) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            '${item.produto.nome} × ${item.quantidade}',
                          ),
                        ),
                        Text(
                          'R\$ ${item.subtotal.toStringAsFixed(2).replaceAll('.', ',')}',
                        ),
                      ],
                    ),
                  ),
                ),
                const Divider(height: 28),
                const SectionTitle('Entrega'),
                DVanilleCard(
                  child: Row(
                    children: [
                      Icon(
                        state.tipoEntregaSelecionada == TipoEntrega.delivery
                            ? Icons.delivery_dining
                            : Icons.storefront,
                        color: AppColors.brown,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              state.tipoEntregaSelecionada ==
                                      TipoEntrega.delivery
                                  ? 'Delivery'
                                  : 'Retirar na loja',
                              style: TextStyle(
                                fontWeight: FontWeight.w600,
                                color: isDark
                                    ? AppColors.darkText
                                    : AppColors.brownStrong,
                              ),
                            ),
                            if (state.tipoEntregaSelecionada ==
                                    TipoEntrega.delivery &&
                                endereco != null)
                              Text(
                                endereco.enderecoResumido,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isDark
                                      ? AppColors.darkTextSecondary
                                      : AppColors.textMuted,
                                ),
                              ),
                          ],
                        ),
                      ),
                      TextButton(
                        onPressed: () =>
                            Navigator.pushNamed(context, '/entrega'),
                        child: const Text('ALTERAR'),
                      ),
                    ],
                  ),
                ),
                const SectionTitle('Pagamento'),
                DVanilleCard(
                  child: Row(
                    children: [
                      const Icon(
                        Icons.payment,
                        color: AppColors.brown,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          state.metodoPagamentoSelecionado?.label ??
                              'Não selecionado',
                          style: TextStyle(
                            fontWeight: FontWeight.w600,
                            color: isDark
                                ? AppColors.darkText
                                : AppColors.brownStrong,
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () =>
                            Navigator.pushNamed(context, '/pagamento'),
                        child: const Text('ALTERAR'),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                _totals(
                  state.cartSubtotal,
                  state.taxaEntregaAtual,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  style: isDark
                      ? ElevatedButton.styleFrom(
                          foregroundColor: AppColors.cream,
                        )
                      : null,
                  onPressed: () =>
                      Navigator.pushNamed(context, '/entrega'),
                  child: const Text('CONTINUAR PARA PAGAMENTO'),
                ),
                const SizedBox(height: 12),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _totals(double subtotal, double taxa) {
    final total = subtotal + taxa;

    return DVanilleCard(
      child: Column(
        children: [
          _line('Subtotal', subtotal),
          _line('Entrega', taxa),
          const Divider(),
          _line('TOTAL', total, bold: true),
        ],
      ),
    );
  }

  Widget _line(
    String label,
    double value, {
    bool bold = false,
  }) =>
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
              ),
            ),
            Text(
              'R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}',
              style: TextStyle(
                fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      );
}
