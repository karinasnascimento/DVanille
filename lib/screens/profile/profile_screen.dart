import 'package:flutter/material.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Perfil'),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          return SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              children: [
                const DVanilleMark(size: 200),
                const SizedBox(height: 3),
                Text(
                  state.user.nome,
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                Text(
                  state.user.email,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 16),
                OutlinedButton(
                  onPressed: () =>
                      Navigator.pushNamed(context, '/editar-perfil'),
                  child: const Text('EDITAR PERFIL'),
                ),
                const SizedBox(height: 12),
                _tile(
                  context,
                  Icons.receipt_long_outlined,
                  'Meus pedidos',
                  '/pedidos',
                ),
                _tile(
                  context,
                  Icons.favorite_border,
                  'Meus favoritos',
                  '/favoritos',
                ),
                _tile(
                  context,
                  Icons.location_on_outlined,
                  'Meus endereços',
                  '/enderecos',
                ),
                _tile(
                  context,
                  Icons.restaurant_menu_outlined,
                  'Restrições alimentares',
                  '/restricoes',
                ),
                _tile(
                  context,
                  Icons.local_cafe_outlined,
                  'Conheça a D’Vanille',
                  '/conheca',
                ),
                _tile(
                  context,
                  Icons.notifications_none,
                  'Notificações',
                  '/notificacoes',
                ),
                _tile(
                  context,
                  Icons.settings_outlined,
                  'Configurações',
                  '/configuracoes',
                ),
                if (state.isAdmin)
                  _tile(
                    context,
                    Icons.admin_panel_settings_outlined,
                    'Área administrativa',
                    '/admin',
                  ),
                const SizedBox(height: 20),
                const BowDecoration(),
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _tile(
    BuildContext context,
    IconData icon,
    String label,
    String route,
  ) {
    return DVanilleCard(
      onTap: () => Navigator.pushNamed(context, route),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        contentPadding: EdgeInsets.zero,
        leading: Icon(icon, color: AppColors.brownStrong),
        title: Text(
          label,
          style: const TextStyle(
            color: AppColors.brownStrong,
            fontWeight: FontWeight.w500,
          ),
        ),
        trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted),
      ),
    );
  }
}

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nomeCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _telCtrl;

  final _telefoneMask = MaskTextInputFormatter(
    mask: '(##) #####-####',
    filter: {'#': RegExp(r'[0-9]')},
  );

  final _senhaCtrl = TextEditingController();
  final _confirmarSenhaCtrl = TextEditingController();
  bool _mostrarSenha = false;
  bool _mostrarConfirmacao = false;

  @override
  void initState() {
    super.initState();
    final u = AppState.instance.user;

    _nomeCtrl = TextEditingController(text: u.nome);
    _emailCtrl = TextEditingController(text: u.email);

    // Formata o telefone que já está salvo no perfil.
    final telefoneNumeros = u.telefone.replaceAll(RegExp(r'\D'), '');

    _telCtrl = TextEditingController(
      text: _telefoneMask.maskText(telefoneNumeros),
    );
  }

  @override
  void dispose() {
    _nomeCtrl.dispose();
    _emailCtrl.dispose();
    _telCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Editar perfil', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Nome',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.brownStrong,
                ),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _nomeCtrl,
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Informe seu nome' : null,
              ),

              const SizedBox(height: 16),

              const Text(
                'E-mail',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.brownStrong,
                ),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                validator: (v) =>
                    (v == null || !v.contains('@')) ? 'E-mail inválido' : null,
              ),

              const SizedBox(height: 16),

              const Text(
                'Telefone',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.brownStrong,
                ),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _telCtrl,
                keyboardType: TextInputType.phone,
                inputFormatters: [_telefoneMask],
                decoration: const InputDecoration(hintText: '(11) 99999-9999'),
                validator: (v) {
                  final numeros = (v ?? '').replaceAll(RegExp(r'\D'), '');

                  if (numeros.isEmpty) {
                    return 'Informe seu telefone';
                  }

                  if (numeros.length != 11) {
                    return 'Informe um telefone válido';
                  }

                  return null;
                },
              ),

              const SizedBox(height: 16),

              const Text(
                'Nova senha',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.brownStrong,
                ),
              ),
              const SizedBox(height: 6),

              TextFormField(
                controller: _senhaCtrl,
                obscureText: !_mostrarSenha,
                decoration: InputDecoration(
                  hintText: 'Digite a nova senha',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _mostrarSenha ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _mostrarSenha = !_mostrarSenha;
                      });
                    },
                  ),
                ),
                validator: (v) {
                  final senha = v ?? '';

                  if (senha.isEmpty && _confirmarSenhaCtrl.text.isEmpty) {
                    return null;
                  }

                  if (senha.length < 4) {
                    return 'A senha deve ter pelo menos 4 caracteres';
                  }

                  return null;
                },
              ),

              const SizedBox(height: 16),

              const Text(
                'Confirmar nova senha',
                style: TextStyle(
                  fontWeight: FontWeight.w600,
                  color: AppColors.brownStrong,
                ),
              ),
              const SizedBox(height: 6),

              TextFormField(
                controller: _confirmarSenhaCtrl,
                obscureText: !_mostrarConfirmacao,
                decoration: InputDecoration(
                  hintText: 'Digite novamente a nova senha',
                  suffixIcon: IconButton(
                    icon: Icon(
                      _mostrarConfirmacao
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _mostrarConfirmacao = !_mostrarConfirmacao;
                      });
                    },
                  ),
                ),
                validator: (v) {
                  final confirmacao = v ?? '';

                  if (_senhaCtrl.text.isEmpty && confirmacao.isEmpty) {
                    return null;
                  }

                  if (confirmacao != _senhaCtrl.text) {
                    return 'As senhas não coincidem';
                  }

                  return null;
                },
              ),

              const SizedBox(height: 26),

              const SizedBox(height: 26),

              ElevatedButton(
                onPressed: () {
                  if (!_formKey.currentState!.validate()) {
                    return;
                  }

                  final novaSenha = _senhaCtrl.text;
                  final confirmacao = _confirmarSenhaCtrl.text;

                  if (novaSenha.isNotEmpty) {
                    if (novaSenha != confirmacao) {
                      showBrandSnackBar(context, 'As senhas não coincidem.');
                      return;
                    }

                    final sucesso = AppState.instance
                        .atualizarSenhaDemonstracao(novaSenha);

                    if (!sucesso) {
                      showBrandSnackBar(
                        context,
                        'A senha deve ter pelo menos 4 caracteres.',
                      );
                      return;
                    }
                  }

                  AppState.instance.updateProfile(
                    nome: _nomeCtrl.text.trim(),
                    email: _emailCtrl.text.trim(),
                    telefone: _telCtrl.text.replaceAll(RegExp(r'\D'), ''),
                  );

                  showBrandSnackBar(
                    context,
                    novaSenha.isEmpty
                        ? 'Perfil atualizado com sucesso!'
                        : 'Perfil e senha de demonstração atualizados!',
                  );

                  Navigator.pop(context);
                },

                child: const Text('SALVAR ALTERAÇÕES'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
