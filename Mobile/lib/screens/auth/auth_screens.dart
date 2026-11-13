import 'package:flutter/material.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

import 'package:mask_text_input_formatter/mask_text_input_formatter.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _senhaCtrl = TextEditingController();
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const DVanilleLogo(height: 70),
                const SizedBox(height: 15),
                Text('Bem-vinda à D\'Vanille',
                    textAlign: TextAlign.center, 
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontFamily: 'CreamCake', 
                      fontSize: 45,
                      color: AppColors.danger
                    )),
                const SizedBox(height: 6),
                Text('Entre para continuar sua experiência doce.',
                    textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 28),
                TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(hintText: 'E-mail', prefixIcon: Icon(Icons.mail_rounded)),
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Informe seu e-mail';
                    if (!v.contains('@')) return 'E-mail inválido';
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _senhaCtrl,
                  obscureText: _obscure,
                  decoration: InputDecoration(
                    hintText: 'Senha',
                    prefixIcon: const Icon(Icons.lock_rounded),
                    suffixIcon: IconButton(
                      icon: Icon(_obscure ? Icons.visibility_off : Icons.visibility, size: 20),
                      onPressed: () => setState(() => _obscure = !_obscure),
                    ),
                  ),
                  validator: (v) => (v == null || v.isEmpty) ? 'Informe sua senha' : null,
                ),
                const SizedBox(height: 22),
                ElevatedButton(
                  style: isDark ? ElevatedButton.styleFrom(foregroundColor: AppColors.cream) : null,
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      final isAdmin = _emailCtrl.text.trim().toLowerCase() == 'admin@dvanille.com';
                      AppState.instance.login(admin: isAdmin, email: isAdmin ? '' : _emailCtrl.text.trim());
                      Navigator.pushNamedAndRemoveUntil(
                        context,
                        isAdmin ? '/admin' : '/main',
                        (r) => false,
                      );
                    }
                  },
                  child: const Text('ENTRAR'),
                ),
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/recuperar'),
                  child: const Text('Esqueci minha senha', 
                  style: TextStyle(fontSize: 17),
                  ),
                ),
                const SizedBox(height: 7),
                TextButton(
                  onPressed: () => Navigator.pushNamed(context, '/cadastro'),
                  child: const Text('Criar uma conta',
                  style: TextStyle(fontSize: 17),
                  ),
                ),
                const SizedBox(height: 14),
                const BowDecoration(),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class CadastroScreen extends StatefulWidget {
  const CadastroScreen({super.key});
  @override
  State<CadastroScreen> createState() => _CadastroScreenState();
}

class _CadastroScreenState extends State<CadastroScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomeCtrl = TextEditingController();
  final _telefoneCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _senhaCtrl = TextEditingController();

  final _telefoneMask = MaskTextInputFormatter(
    mask: '(##) #####-####',
    filter: {'#': RegExp(r'[0-9]')},
  );

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: const DVanilleHeader(title: 'Criar conta', showBack: true, showMark: false),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Center(child: DVanilleLogo(height: 72)),
                const SizedBox(height: 24),
                TextFormField(
                  controller: _nomeCtrl,
                  decoration: const InputDecoration(hintText: 'Nome completo', prefixIcon: Icon(Icons.person_rounded)),
                  validator: (v) => (v == null || v.isEmpty) ? 'Informe seu nome' : null,
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _telefoneCtrl,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [_telefoneMask],
                  decoration: const InputDecoration(hintText: 'Telefone', prefixIcon: Icon(Icons.phone_rounded)),
                  validator: (v) {
                    if (v == null || v.isEmpty) {
                      return 'Informe seu número';
                    }
                    if (_telefoneMask.getUnmaskedText().length != 11) {
                      return 'Informe um telefone válido';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(hintText: 'E-mail', prefixIcon: Icon(Icons.mail_rounded)),
                  validator: (v) => (v == null || !v.contains('@')) ? 'E-mail inválido' : null,
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _senhaCtrl,
                  obscureText: true,
                  decoration: const InputDecoration(hintText: 'Senha', prefixIcon: Icon(Icons.lock_rounded)),
                  validator: (v) => (v == null || v.length < 4) ? 'Mínimo de 4 caracteres' : null,
                ),
                const SizedBox(height: 22),
                ElevatedButton(
                  style: isDark ? ElevatedButton.styleFrom(foregroundColor: AppColors.cream) : null,
                  onPressed: () {
                    if (_formKey.currentState!.validate()) {
                      AppState.instance.updateProfile(
                        nome: _nomeCtrl.text.trim(),
                        email: _emailCtrl.text.trim(),
                        telefone: _telefoneMask.getUnmaskedText(),
                      );
                      AppState.instance.login();
                      Navigator.pushNamedAndRemoveUntil(context, '/main', (r) => false);
                    }
                  },
                  child: const Text('CRIAR CONTA'),
                ),
                const SizedBox(height: 20),
                const Center(child: BowDecoration()),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class RecuperarScreen extends StatefulWidget {
  const RecuperarScreen({super.key});
  @override
  State<RecuperarScreen> createState() => _RecuperarScreenState();
}

class _RecuperarScreenState extends State<RecuperarScreen> {
  final _emailCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: const DVanilleHeader(title: 'Recuperar senha', showBack: true, showMark: false),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              Text('Informe seu e-mail para receber as instruções de recuperação.',
                  style: Theme.of(context).textTheme.bodyMedium),
              const SizedBox(height: 20),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(hintText: 'E-mail', prefixIcon: Icon(Icons.mail_rounded)),
              ),
              const SizedBox(height: 22),
              ElevatedButton(
                style: isDark ? ElevatedButton.styleFrom(foregroundColor: AppColors.cream) : null,
                onPressed: () {
                  final ok = _emailCtrl.text.contains('@');
                  Navigator.pushNamed(context, ok ? '/emailok' : '/emailfail');
                },
                child: const Text('ENVIAR'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class EmailOkScreen extends StatelessWidget {
  const EmailOkScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.mark_email_read_rounded, size: 48, color: AppColors.success),
                const SizedBox(height: 16),
                Text('E-mail enviado!', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text('Verifique sua caixa de entrada para redefinir sua senha.',
                    textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pushNamedAndRemoveUntil(context, '/login', (r) => false),
                  child: const Text('VOLTAR AO LOGIN'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class EmailFailScreen extends StatelessWidget {
  const EmailFailScreen({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_rounded, size: 48, color: AppColors.danger),
                const SizedBox(height: 16),
                Text('Não foi possível enviar', style: Theme.of(context).textTheme.headlineSmall),
                const SizedBox(height: 8),
                Text('Verifique o e-mail informado e tente novamente.',
                    textAlign: TextAlign.center, style: Theme.of(context).textTheme.bodyMedium),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('TENTAR NOVAMENTE'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}