import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

String _fmtDate(DateTime d) =>
    '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

class OrdersScreen extends StatelessWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Meus pedidos', showBack: true),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          if (state.orders.isEmpty) {
            return EmptyState(
              icon: Icons.receipt_long_outlined,
              message: 'Você ainda não fez nenhum pedido.',
              buttonLabel: 'VER CARDÁPIO',
              onButtonTap: () => Navigator.pushNamed(context, '/cardapio'),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(18),
            children: [
              if (state.ongoingOrders.isNotEmpty) ...[
                const SectionTitle('Em andamento'),
                ...state.ongoingOrders.map((o) => _OrderTile(order: o, ongoing: true)),
              ],
              if (state.historyOrders.isNotEmpty) ...[
                const SectionTitle('Histórico'),
                ...state.historyOrders.map((o) => _OrderTile(order: o, ongoing: false)),
              ],
            ],
          );
        },
      ),
    );
  }
}

class _OrderTile extends StatelessWidget {
  final Order order;
  final bool ongoing;
  const _OrderTile({required this.order, required this.ongoing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: DVanilleCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Pedido ${order.numeroPedido}',
                    style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong)),
                Text('R\$ ${order.total.toStringAsFixed(2).replaceAll('.', ',')}',
                    style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong)),
              ],
            ),
            SizedBox(height: 4),
            Text(_fmtDate(order.data), style: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.textMuted, fontSize: 12)),
            SizedBox(height: 6),
            Row(
              children: [
                Icon(
                  ongoing ? Icons.access_time : Icons.check_circle,
                  size: 15,
                  color: ongoing ? AppColors.warning : AppColors.success,
                ),
                SizedBox(width: 6),
                Text(order.status.label, style: TextStyle(fontSize: 13, color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong)),
              ],
            ),
            SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pushNamed(context, ongoing ? '/rastreamento' : '/pedido-detalhes', arguments: order),
                child: Text(ongoing ? 'ACOMPANHAR' : 'VER DETALHES'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class OrderDetailsScreen extends StatelessWidget {
  final Order order;
  const OrderDetailsScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Detalhes do pedido', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Pedido ${order.numeroPedido}', style: Theme.of(context).textTheme.titleLarge),
            Text(_fmtDate(order.data), style: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.textMuted)),
            const SectionTitle('Produtos'),
            ...order.produtos.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(child: Text('${item.produto.nome} × ${item.quantidade}')),
                      Text('R\$ ${item.subtotal.toStringAsFixed(2).replaceAll('.', ',')}'),
                    ],
                  ),
                )),
            Divider(height: 28),
            _line('Subtotal', order.subtotal),
            _line('Entrega', order.taxaEntrega),
            Divider(),
            _line('TOTAL', order.total, bold: true),
            SizedBox(height: 14),
            Text('Pagamento: ${order.metodoPagamento.label}', style: Theme.of(context).textTheme.bodyMedium),
            Text('Entrega: ${order.tipoEntrega == TipoEntrega.delivery ? 'Delivery' : 'Retirada'}',
                style: Theme.of(context).textTheme.bodyMedium),
            SizedBox(height: 8),
            Text('Status: ${order.status.label}', style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong)),
            SizedBox(height: 20),
            if (order.status != StatusPedido.entregue && order.status != StatusPedido.retirado)
              ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/rastreamento', arguments: order),
                child: Text('ACOMPANHAR PEDIDO'),
              ),
          ],
        ),
      ),
    );
  }

  Widget _line(String label, double value, {bool bold = false}) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: TextStyle(fontWeight: bold ? FontWeight.w700 : FontWeight.w400)),
            Text('R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}',
                style: TextStyle(fontWeight: bold ? FontWeight.w700 : FontWeight.w500)),
          ],
        ),
      );
}

class OrderTrackingScreen extends StatelessWidget {
  final Order order;
  const OrderTrackingScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Acompanhar pedido', showBack: true),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final flow = order.fluxoStatus;
          final currentIndex = flow.indexOf(order.status);
          final finished = currentIndex == flow.length - 1;
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Pedido ${order.numeroPedido}', style: Theme.of(context).textTheme.titleLarge),
                SizedBox(height: 20),
                ...List.generate(flow.length, (i) {
                  final done = i <= currentIndex;
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Column(
                        children: [
                          Icon(
                            done ? Icons.check_circle : Icons.radio_button_unchecked,
                            color: done ? AppColors.success : (Theme.of(context).brightness == Brightness.dark ? AppColors.darkBorder : AppColors.beige),
                            size: 20,
                          ),
                          if (i != flow.length - 1)
                            Container(width: 2, height: 34, color: done ? AppColors.success : (Theme.of(context).brightness == Brightness.dark ? AppColors.darkBorder : AppColors.beige)),
                        ],
                      ),
                      SizedBox(width: 12),
                      Padding(
                        padding: const EdgeInsets.only(top: 1),
                        child: Text(
                          flow[i].label,
                          style: TextStyle(
                            fontWeight: done ? FontWeight.w700 : FontWeight.w400,
                            color: done ? (Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong) : (Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.textMuted),
                          ),
                        ),
                      ),
                    ],
                  );
                }),
                Divider(height: 32),
                Text('Previsão: 25–40 minutos', style: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.textMuted)),
                SizedBox(height: 20),
                ElevatedButton(
                  onPressed: finished ? null : () => state.advanceOrderStatus(order),
                  child: Text('SIMULAR PRÓXIMO STATUS'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
