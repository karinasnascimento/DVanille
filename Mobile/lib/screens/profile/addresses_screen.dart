import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

class AddressesScreen extends StatelessWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryText = isDark ? AppColors.darkText : AppColors.brownStrong;
    final secondaryText = isDark ? AppColors.darkTextSecondary : AppColors.textMuted;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Meus endereços', showBack: true),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          if (state.addresses.isEmpty) {
            return EmptyState(
              icon: Icons.location_on_outlined,
              message: 'Você ainda não possui endereços cadastrados.',
              buttonLabel: '+ ADICIONAR ENDEREÇO',
              onButtonTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressFormScreen())),
            );
          }
          return ListView(
            padding: const EdgeInsets.all(18),
            children: [
              ...state.addresses.map((a) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: DVanilleCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(a.apelido.toUpperCase(),
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 0.6, color: primaryText)),
                          const SizedBox(height: 6),
                          Text(a.enderecoResumido),
                          Text(a.cidadeEstado, style: TextStyle(color: secondaryText, fontSize: 13)),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              if (a.principal)
                                const Row(children: [
                                  Icon(Icons.star, size: 16, color: AppColors.warning),
                                  SizedBox(width: 4),
                                  Text('Principal', style: TextStyle(fontSize: 12, color: AppColors.warning, fontWeight: FontWeight.w600)),
                                ])
                              else
                                TextButton(
                                  onPressed: () => state.setEnderecoPrincipal(a.id),
                                  child: const Text('DEFINIR COMO PRINCIPAL'),
                                ),
                              const Spacer(),
                              TextButton(
                                onPressed: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => AddressFormScreen(address: a)),
                                ),
                                child: const Text('EDITAR'),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline, color: AppColors.danger, size: 20),
                                onPressed: () => state.removeAddress(a.id),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  )),
              OutlinedButton.icon(
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AddressFormScreen())),
                icon: const Icon(Icons.add),
                label: const Text('ADICIONAR ENDEREÇO'),
              ),
              const SizedBox(height: 10),
            ],
          );
        },
      ),
    );
  }
}

class AddressFormScreen extends StatefulWidget {
  final Address? address;
  const AddressFormScreen({super.key, this.address});

  @override
  State<AddressFormScreen> createState() => _AddressFormScreenState();
}

class _AddressFormScreenState extends State<AddressFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _apelidoCtrl;
  late final TextEditingController _cepCtrl;
  late final TextEditingController _ruaCtrl;
  late final TextEditingController _numeroCtrl;
  late final TextEditingController _complementoCtrl;
  late final TextEditingController _bairroCtrl;
  late final TextEditingController _cidadeCtrl;
  late final TextEditingController _estadoCtrl;

  @override
  void initState() {
    super.initState();
    final a = widget.address;
    _apelidoCtrl = TextEditingController(text: a?.apelido ?? '');
    _cepCtrl = TextEditingController(text: a?.cep ?? '');
    _ruaCtrl = TextEditingController(text: a?.rua ?? '');
    _numeroCtrl = TextEditingController(text: a?.numero ?? '');
    _complementoCtrl = TextEditingController(text: a?.complemento ?? '');
    _bairroCtrl = TextEditingController(text: a?.bairro ?? '');
    _cidadeCtrl = TextEditingController(text: a?.cidade ?? 'São Paulo');
    _estadoCtrl = TextEditingController(text: a?.estado ?? 'SP');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: DVanilleHeader(title: widget.address == null ? 'Adicionar endereço' : 'Editar endereço', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _field(_apelidoCtrl, 'Apelido (ex: Casa, Trabalho)', required: true),
              _field(_cepCtrl, 'CEP', keyboardType: TextInputType.number, required: true),
              _field(_ruaCtrl, 'Rua', required: true),
              Row(
                children: [
                  Expanded(child: _field(_numeroCtrl, 'Número', keyboardType: TextInputType.number, required: true)),
                  const SizedBox(width: 12),
                  Expanded(flex: 2, child: _field(_complementoCtrl, 'Complemento')),
                ],
              ),
              _field(_bairroCtrl, 'Bairro', required: true),
              Row(
                children: [
                  Expanded(flex: 2, child: _field(_cidadeCtrl, 'Cidade', required: true)),
                  const SizedBox(width: 12),
                  Expanded(child: _field(_estadoCtrl, 'UF', required: true)),
                ],
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    final state = AppState.instance;
                    if (widget.address == null) {
                      state.addAddress(Address(
                        id: IdGen.next('addr'),
                        apelido: _apelidoCtrl.text,
                        cep: _cepCtrl.text,
                        rua: _ruaCtrl.text,
                        numero: _numeroCtrl.text,
                        complemento: _complementoCtrl.text,
                        bairro: _bairroCtrl.text,
                        cidade: _cidadeCtrl.text,
                        estado: _estadoCtrl.text,
                      ));
                    } else {
                      final a = widget.address!;
                      a.apelido = _apelidoCtrl.text;
                      a.cep = _cepCtrl.text;
                      a.rua = _ruaCtrl.text;
                      a.numero = _numeroCtrl.text;
                      a.complemento = _complementoCtrl.text;
                      a.bairro = _bairroCtrl.text;
                      a.cidade = _cidadeCtrl.text;
                      a.estado = _estadoCtrl.text;
                      state.updateAddress(a);
                    }
                    showBrandSnackBar(context, 'Endereço salvo com sucesso!');
                    Navigator.pop(context);
                  }
                },
                child: const Text('SALVAR ENDEREÇO'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label, {TextInputType? keyboardType, bool required = false}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fieldTextColor = isDark ? AppColors.darkText : AppColors.brownStrong;
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        style: TextStyle(color: fieldTextColor),
        decoration: InputDecoration(
          hintText: label,
          hintStyle: TextStyle(color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted),
        ),
        validator: required ? (v) => (v == null || v.isEmpty) ? 'Campo obrigatório' : null : null,
      ),
    );
  }
}
