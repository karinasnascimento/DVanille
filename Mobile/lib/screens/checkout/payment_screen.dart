import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});
  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  MetodoPagamento? metodo;
  bool precisaTroco = false;
  final _trocoCtrl = TextEditingController();
  String? trocoErro;

  final _numeroCtrl = TextEditingController();
  final _nomeCtrl = TextEditingController();
  final _validadeCtrl = TextEditingController();
  final _cvvCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    metodo = AppState.instance.metodoPagamentoSelecionado;
  }

  @override
  void dispose() {
    _trocoCtrl.dispose();
    _numeroCtrl.dispose();
    _nomeCtrl.dispose();
    _validadeCtrl.dispose();
    _cvvCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final total = state.cartSubtotal + state.taxaEntregaAtual;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;

    return Scaffold(
      appBar: const DVanilleHeader(title: 'Pagamento', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'MÉTODO DE PAGAMENTO',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: primaryText,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 14),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.7,
              children: [
                _method(
                  MetodoPagamento.dinheiro,
                  Icons.payments_outlined,
                  'DINHEIRO',
                ),
                _method(
                  MetodoPagamento.cartaoCredito,
                  Icons.credit_card,
                  'CRÉDITO',
                ),
                _method(
                  MetodoPagamento.cartaoDebito,
                  Icons.credit_card_outlined,
                  'DÉBITO',
                ),
                _method(MetodoPagamento.pix, Icons.qr_code, 'PIX'),
                _method(
                  MetodoPagamento.carteira,
                  Icons.account_balance_wallet_outlined,
                  'CARTEIRA',
                ),
              ],
            ),
            const SizedBox(height: 20),
            if (metodo == MetodoPagamento.dinheiro) _cashSection(),
            if (metodo == MetodoPagamento.cartaoCredito ||
                metodo == MetodoPagamento.cartaoDebito)
              _cardSection(),
            if (metodo == MetodoPagamento.pix) _pixSection(total),
            if (metodo == MetodoPagamento.carteira) _walletSection(),
            const Divider(height: 32),
            Text(
              'DETALHES',
              style: TextStyle(
                fontWeight: FontWeight.w700,
                color: primaryText,
                fontSize: 13,
              ),
            ),
            const SizedBox(height: 10),
            _totalRow('Subtotal', state.cartSubtotal),
            _totalRow('Entrega', state.taxaEntregaAtual),
            const Divider(),
            _totalRow('TOTAL', total, bold: true),
            const SizedBox(height: 20),
            ElevatedButton(
              style: isDark
                  ? ElevatedButton.styleFrom(foregroundColor: AppColors.cream)
                  : null,
              onPressed: metodo == null
                  ? null
                  : () => _confirmar(context, total),
              child: const Text('CONFIRMAR PAGAMENTO'),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  void _confirmar(BuildContext context, double total) {
    if (metodo == MetodoPagamento.dinheiro && precisaTroco) {
      final valor = double.tryParse(_trocoCtrl.text.replaceAll(',', '.'));
      if (valor == null || valor < total) {
        setState(
          () => trocoErro = 'Informe um valor suficiente para cobrir o total.',
        );
        return;
      }
    }
    if ((metodo == MetodoPagamento.cartaoCredito ||
            metodo == MetodoPagamento.cartaoDebito) &&
        (_numeroCtrl.text.isEmpty ||
            _nomeCtrl.text.isEmpty ||
            _validadeCtrl.text.isEmpty ||
            _cvvCtrl.text.isEmpty)) {
      showBrandSnackBar(context, 'Preencha todos os dados do cartão.');
      return;
    }
    AppState.instance.setMetodoPagamento(metodo!);
    AppState.instance.trocoPara = precisaTroco
        ? double.tryParse(_trocoCtrl.text.replaceAll(',', '.'))
        : null;
    Navigator.pushNamed(context, '/checkout-ok');
  }

  Widget _method(MetodoPagamento m, IconData icon, String label) {
    final selected = metodo == m;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedColor = isDark ? AppColors.darkButton : AppColors.brown;
    final unselectedColor = isDark ? AppColors.darkSurface : AppColors.white;
    final textColor = isDark ? AppColors.darkText : AppColors.brownStrong;
    return GestureDetector(
      onTap: () => setState(() => metodo = m),
      child: Container(
        decoration: BoxDecoration(
          color: selected ? selectedColor : unselectedColor,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(
            color: selected
                ? selectedColor
                : (isDark ? AppColors.darkBorder : AppColors.beige),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: selected
                  ? (isDark ? AppColors.darkBackground : Colors.white)
                  : textColor,
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                color: selected
                    ? (isDark ? AppColors.darkBackground : Colors.white)
                    : textColor,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _cashSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
    return DVanilleCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Precisa de troco?',
            style: TextStyle(fontWeight: FontWeight.w600, color: primaryText),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _pill(
                'SIM',
                precisaTroco,
                () => setState(() => precisaTroco = true),
              ),
              const SizedBox(width: 10),
              _pill(
                'NÃO',
                !precisaTroco,
                () => setState(() {
                  precisaTroco = false;
                  trocoErro = null;
                }),
              ),
            ],
          ),
          if (precisaTroco) ...[
            const SizedBox(height: 14),
            TextField(
              controller: _trocoCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                hintText: 'Troco para quanto? (ex: 100,00)',
                errorText: trocoErro,
              ),
              onChanged: (_) => setState(() => trocoErro = null),
            ),
          ],
        ],
      ),
    );
  }

  Widget _pill(String label, bool selected, VoidCallback onTap) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedColor = isDark ? AppColors.darkButton : AppColors.brown;
    final unselectedColor = isDark ? AppColors.darkSecondary : AppColors.cream;
    final textColor = isDark ? AppColors.darkText : AppColors.brownStrong;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          color: selected ? selectedColor : unselectedColor,
          borderRadius: BorderRadius.circular(AppRadius.pill),
          border: Border.all(
            color: selected
                ? selectedColor
                : (isDark ? AppColors.darkBorder : AppColors.beige),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected
                ? (isDark ? AppColors.darkBackground : Colors.white)
                : textColor,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }

  Widget _cardSection() {
    return DVanilleCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              _pill(
                'CRÉDITO',
                metodo == MetodoPagamento.cartaoCredito,
                () => setState(() => metodo = MetodoPagamento.cartaoCredito),
              ),
              const SizedBox(width: 10),
              _pill(
                'DÉBITO',
                metodo == MetodoPagamento.cartaoDebito,
                () => setState(() => metodo = MetodoPagamento.cartaoDebito),
              ),
            ],
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _numeroCtrl,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: 'Número do cartão'),
          ),
          const SizedBox(height: 10),
          TextField(
            controller: _nomeCtrl,
            decoration: const InputDecoration(
              hintText: 'Nome impresso no cartão',
            ),
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _validadeCtrl,
                  decoration: const InputDecoration(
                    hintText: 'Validade (MM/AA)',
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _cvvCtrl,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(hintText: 'CVV'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _pixSection(double total) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
    final secondaryText =
        isDark ? AppColors.darkTextSecondary : AppColors.textMuted;
    return DVanilleCard(
      child: Column(
        children: [
          Icon(Icons.qr_code_2, size: 84, color: primaryText),
          const SizedBox(height: 10),
          Text(
            'Valor: R\$ ${total.toStringAsFixed(2).replaceAll('.', ',')}',
            style: TextStyle(fontWeight: FontWeight.w700, color: primaryText),
          ),
          const SizedBox(height: 6),
          Text(
            'Escaneie o QR Code acima e clique em Confirmar Pagamento.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: secondaryText),
          ),
        ],
      ),
    );
  }

  Widget _walletSection() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
    return DVanilleCard(
      child: Row(
        children: [
          Icon(Icons.account_balance_wallet, color: primaryText),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Carteira digital D\'Vanille selecionada.',
              style: TextStyle(fontSize: 13, color: primaryText),
            ),
          ),
        ],
      ),
    );
  }

  Widget _totalRow(String label, double value, {bool bold = false}) {
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
            ),
          ),
          Text(
            'R\$ ${value.toStringAsFixed(2).replaceAll('.', ',')}',
            style: TextStyle(
              fontWeight: bold ? FontWeight.w700 : FontWeight.w500,
              fontSize: bold ? 16 : 14,
            ),
          ),
        ],
      ),
    );
  }
}