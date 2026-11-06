import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

class DeliveryScreen extends StatefulWidget {
  const DeliveryScreen({super.key});
  @override
  State<DeliveryScreen> createState() => _DeliveryScreenState();
}

class _DeliveryScreenState extends State<DeliveryScreen> {
  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Entrega', showBack: true),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final endereco = state.enderecoSelecionado ?? state.enderecoPrincipal;
          final isDelivery = state.tipoEntregaSelecionada == TipoEntrega.delivery;
          final isDark = Theme.of(context).brightness == Brightness.dark;
          final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
          final secondaryText = isDark ? AppColors.darkTextSecondary : AppColors.textMuted;
          return Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Como você quer receber?',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16, color: primaryText)),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: _OptionCard(
                        icon: Icons.storefront,
                        label: 'RETIRAR\nNA LOJA',
                        selected: !isDelivery,
                        onTap: () => state.setTipoEntrega(TipoEntrega.retirada),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _OptionCard(
                        icon: Icons.delivery_dining,
                        label: 'DELIVERY',
                        selected: isDelivery,
                        onTap: () => state.setTipoEntrega(TipoEntrega.delivery),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 26),
                if (isDelivery) ...[
                  Text('ENDEREÇO', style: TextStyle(fontWeight: FontWeight.w700, color: primaryText, fontSize: 13)),
                  const SizedBox(height: 10),
                  if (endereco == null)
                    DVanilleCard(
                      child: Row(
                        children: [
                          const Expanded(child: Text('Nenhum endereço cadastrado.')),
                          TextButton(
                            onPressed: () => Navigator.pushNamed(context, '/enderecos'),
                            child: const Text('ADICIONAR'),
                          ),
                        ],
                      ),
                    )
                  else
                    DVanilleCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(endereco.apelido, style: TextStyle(fontWeight: FontWeight.w700, color: primaryText)),
                          const SizedBox(height: 2),
                          Text(endereco.enderecoResumido, style: TextStyle(color: secondaryText, fontSize: 13)),
                          Text(endereco.cidadeEstado, style: TextStyle(color: secondaryText, fontSize: 13)),
                        ],
                      ),
                    ),
                  const SizedBox(height: 10),
                  OutlinedButton(
                    onPressed: () async {
                      await Navigator.pushNamed(context, '/enderecos');
                    },
                    child: const Text('ALTERAR ENDEREÇO'),
                  ),
                  const SizedBox(height: 20),
                  Text('Tempo estimado: 25–40 min', style: TextStyle(color: secondaryText)),
                ] else ...[
                  DVanilleCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('D\'Vanille — Loja Boutique', style: TextStyle(fontWeight: FontWeight.w700, color: primaryText)),
                        SizedBox(height: 4),
                        Text('Rua das Flores, 45 — São Paulo - SP', style: TextStyle(color: secondaryText, fontSize: 13)),
                        SizedBox(height: 10),
                        Text('Tempo de preparo estimado: 15–25 min', style: TextStyle(color: secondaryText, fontSize: 13)),
                      ],
                    ),
                  ),
                ],
                const Spacer(),
                ElevatedButton(
                  onPressed: (isDelivery && endereco == null)
                      ? null
                      : () {
                          if (endereco != null) state.setEnderecoSelecionado(endereco);
                          Navigator.pushNamed(context, '/pagamento');
                        },
                  child: const Text('CONTINUAR'),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _OptionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _OptionCard({required this.icon, required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final selectedColor = isDark ? AppColors.darkButton : AppColors.brown;
    final cardColor = isDark ? AppColors.darkSurface : AppColors.white;
    final textColor = isDark ? AppColors.darkText : AppColors.brownStrong;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 22),
        decoration: BoxDecoration(
          color: selected ? selectedColor : cardColor,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: selected ? selectedColor : (isDark ? AppColors.darkBorder : AppColors.beige)),
        ),
        child: Column(
          children: [
            Icon(icon, color: selected ? (isDark ? AppColors.darkBackground : Colors.white) : textColor, size: 28),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: selected ? (isDark ? AppColors.darkBackground : Colors.white) : textColor,
                fontWeight: FontWeight.w700,
                fontSize: 12.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
