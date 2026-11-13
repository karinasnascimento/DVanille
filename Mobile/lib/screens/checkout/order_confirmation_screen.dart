import 'package:flutter/material.dart';

import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

class OrderConfirmationScreen extends StatefulWidget {
  const OrderConfirmationScreen({super.key});

  @override
  State<OrderConfirmationScreen> createState() =>
      _OrderConfirmationScreenState();
}

class _OrderConfirmationScreenState extends State<OrderConfirmationScreen> {
  Order? order;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    order ??= AppState.instance.createOrder();
  }

  String _currency(double value) =>
      'R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}';

  @override
  Widget build(BuildContext context) {
    final currentOrder = order;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimary = isDark ? AppColors.darkText : AppColors.brownStrong;
    final textSecondary =
        isDark ? AppColors.darkTextSecondary : AppColors.textMuted;
    final accent = isDark ? AppColors.darkHighlight : AppColors.success;
    final panelColor = isDark ? AppColors.darkSurface : AppColors.white;

    return Scaffold(
      body: SafeArea(
        child: currentOrder == null
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(22, 24, 22, 30),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 520),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Center(child: DVanilleLogo(height: 52)),
                        const SizedBox(height: 22),
                        Container(
                          padding: const EdgeInsets.fromLTRB(22, 26, 22, 24),
                          decoration: BoxDecoration(
                            color: panelColor,
                            borderRadius: BorderRadius.circular(28),
                            border: Border.all(
                              color: isDark
                                  ? AppColors.darkBorder
                                  : AppColors.beige,
                            ),
                          ),
                          child: Column(
                            children: [
                              Container(
                                width: 76,
                                height: 76,
                                decoration: BoxDecoration(
                                  color: accent.withValues(alpha: 0.16),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.check_rounded,
                                  size: 43,
                                  color: AppColors.success,
                                ),
                              ),
                              const SizedBox(height: 18),
                              Text(
                                'Pedido realizado!',
                                textAlign: TextAlign.center,
                                style: Theme.of(context)
                                    .textTheme
                                    .headlineSmall
                                    ?.copyWith(fontSize: 27),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                'Seu pedido foi recebido com carinho.\nAgora é só acompanhar as próximas etapas!',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: textSecondary,
                                  height: 1.45,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 20),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  color: accent.withValues(alpha: 0.13),
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.receipt_long_rounded,
                                        size: 17, color: accent),
                                    const SizedBox(width: 8),
                                    Text(
                                      'Pedido ${currentOrder.numeroPedido}',
                                      style: TextStyle(
                                        color: textPrimary,
                                        fontWeight: FontWeight.w700,
                                        letterSpacing: 0.3,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 18),
                        _ConfirmationDetailsCard(
                          title: 'Resumo do pedido',
                          icon: Icons.shopping_bag_outlined,
                          isDark: isDark,
                          children: [
                            _ConfirmationInfoRow(
                              label: 'Itens',
                              value:
                                  '${currentOrder.produtos.fold<int>(0, (sum, item) => sum + item.quantidade)} ${currentOrder.produtos.fold<int>(0, (sum, item) => sum + item.quantidade) == 1 ? 'produto' : 'produtos'}',
                              isDark: isDark,
                            ),
                            _ConfirmationInfoRow(
                              label: 'Subtotal',
                              value: _currency(currentOrder.subtotal),
                              isDark: isDark,
                            ),
                            _ConfirmationInfoRow(
                              label: 'Entrega',
                              value: currentOrder.taxaEntrega == 0
                                  ? 'Grátis'
                                  : _currency(currentOrder.taxaEntrega),
                              isDark: isDark,
                            ),
                            Padding(
                              padding: const EdgeInsets.only(top: 10),
                              child: Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    'Total',
                                    style: TextStyle(
                                      color: textPrimary,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 16,
                                    ),
                                  ),
                                  Text(
                                    _currency(currentOrder.total),
                                    style: TextStyle(
                                      color: isDark
                                          ? AppColors.darkHighlight
                                          : AppColors.brownStrong,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 18,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        _ConfirmationDetailsCard(
                          title: 'Como você vai receber',
                          icon: currentOrder.tipoEntrega == TipoEntrega.delivery
                              ? Icons.delivery_dining_rounded
                              : Icons.storefront_outlined,
                          isDark: isDark,
                          children: [
                            Text(
                              currentOrder.tipoEntrega == TipoEntrega.delivery
                                  ? 'Delivery'
                                  : 'Retirada na loja',
                              style: TextStyle(
                                color: textPrimary,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            if (currentOrder.endereco != null) ...[
                              const SizedBox(height: 5),
                              Text(
                                '${currentOrder.endereco!.enderecoResumido} · ${currentOrder.endereco!.bairro}',
                                style: TextStyle(
                                  color: textSecondary,
                                  fontSize: 13,
                                  height: 1.4,
                                ),
                              ),
                            ],
                            const SizedBox(height: 12),
                            Divider(
                              height: 1,
                              color: isDark
                                  ? AppColors.darkBorder
                                  : AppColors.beige,
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Icon(Icons.payments_outlined,
                                    size: 19, color: textSecondary),
                                const SizedBox(width: 9),
                                Expanded(
                                  child: Text(
                                    'Pagamento: ${currentOrder.metodoPagamento.label}',
                                    style: TextStyle(
                                      color: textPrimary,
                                      fontSize: 13,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                        const SizedBox(height: 22),
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.pushNamedAndRemoveUntil(
                              context,
                              '/rastreamento',
                              (route) => route.settings.name == '/main',
                              arguments: currentOrder,
                            );
                          },
                          icon: const Icon(Icons.local_shipping_outlined),
                          label: const Text('ACOMPANHAR MEU PEDIDO'),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton(
                          onPressed: () =>
                              Navigator.pushNamedAndRemoveUntil(
                            context,
                            '/main',
                            (route) => false,
                          ),
                          child: const Text('VOLTAR AO INÍCIO'),
                        ),
                        const SizedBox(height: 18),
                        Center(
                          child: Text(
                            'Feito com carinho, D’Vanille ♡',
                            style: TextStyle(
                              color: textSecondary,
                              fontFamily: 'serif',
                              fontStyle: FontStyle.italic,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        const SizedBox(height: 10),
                        const Center(child: BowDecoration(size: 34)),
                      ],
                    ),
                  ),
                ),
              ),
      ),
    );
  }
}

class _ConfirmationDetailsCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final bool isDark;
  final List<Widget> children;

  const _ConfirmationDetailsCard({
    required this.title,
    required this.icon,
    required this.isDark,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSecondary : AppColors.cream,
        borderRadius: BorderRadius.circular(21),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.beige,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                size: 20,
                color: isDark ? AppColors.darkHighlight : AppColors.brown,
              ),
              const SizedBox(width: 9),
              Text(
                title,
                style: TextStyle(
                  color: isDark ? AppColors.darkText : AppColors.brownStrong,
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          ...children,
        ],
      ),
    );
  }
}

class _ConfirmationInfoRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isDark;

  const _ConfirmationInfoRow({
    required this.label,
    required this.value,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted,
              fontSize: 13,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              color: isDark ? AppColors.darkText : AppColors.brownStrong,
              fontWeight: FontWeight.w600,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}
