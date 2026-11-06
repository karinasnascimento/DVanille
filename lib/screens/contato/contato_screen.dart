import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

class ContatoScreen extends StatelessWidget {
  const ContatoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DVanilleHeader(showBack: true),
      body: Column(
        children: [
          Divider(height: 1),
          Expanded(
            child: SingleChildScrollView(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 1000),
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(22, 28, 22, 48),
                    child: Column(
                      children: [
                        const _ContatoHeader(),
                        SizedBox(height: 28),
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final wide = constraints.maxWidth >= 760;
                            if (wide) {
                              return Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Expanded(child: _InfoCard()),
                                  SizedBox(width: 22),
                                  Expanded(child: _ContatoFormCard()),
                                ],
                              );
                            }
                            return Column(
                              children: [
                                _InfoCard(),
                                SizedBox(height: 22),
                                _ContatoFormCard(),
                              ],
                            );
                          },
                        ),
                        SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ContatoHeader extends StatelessWidget {
  const _ContatoHeader();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Fale conosco',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: 'CreamCake',
            fontSize: 42,
            height: 1.1,
            color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkHighlight : AppColors.danger,
          ),
        ),
        SizedBox(height: 10),
        Text(
          'Entre em contato com a D’Vanille',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontStyle: FontStyle.italic,
            fontSize: 17,
            fontWeight: FontWeight.w600,
            height: 1.35,
            color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong,
          ),
        ),
      ],
    );
  }
}

class _InfoItem {
  final IconData icon;
  final String text;
  const _InfoItem(this.icon, this.text);
}

class _InfoCard extends StatelessWidget {
  const _InfoCard();

  static const List<_InfoItem> _items = [
    _InfoItem(
      Icons.location_on_outlined,
      'Rua das Baunilhas, 245 — São Paulo/SP',
    ),
    _InfoItem(Icons.schedule_outlined, 'Terça a Domingo'),
    _InfoItem(Icons.phone_outlined, '(11) 4002-8922 · WhatsApp'),
    _InfoItem(Icons.mail_outline, 'contato@dvanille.com.br'),
    _InfoItem(Icons.camera_alt_outlined, '@dvanille.cafe'),
  ];

  @override
  Widget build(BuildContext context) {
    return DVanilleCard(
      padding: const EdgeInsets.fromLTRB(22, 24, 22, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Informações',
            style: TextStyle(
              fontFamily: 'CreamCake',
              fontSize: 32,
              height: 1.1,
              color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.brown,
            ),
          ),
          SizedBox(height: 18),
          for (int i = 0; i < _items.length; i++) ...[
            if (i > 0) SizedBox(height: 14),
            _InfoRow(item: _items[i]),
          ],
          SizedBox(height: 22),
          Divider(),
          SizedBox(height: 12),
          Text(
            "Equipe D'Vanille: Ana Clara, Julia, Karina e Viviane.",
            style: TextStyle(
              fontStyle: FontStyle.italic,
              fontSize: 14.5,
              height: 1.45,
              color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.brown,
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final _InfoItem item;
  const _InfoRow({required this.item});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkHighlight.withValues(alpha: 0.16) : AppColors.pink.withValues(alpha: 0.45),
            shape: BoxShape.circle,
          ),
          child: Icon(item.icon, size: 18, color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.brown),
        ),
        SizedBox(width: 12),
        Expanded(
          child: Text(
            item.text,
            style: TextStyle(
              fontSize: 14.5,
              height: 1.4,
              color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong,
            ),
          ),
        ),
      ],
    );
  }
}

class _ContatoFormCard extends StatefulWidget {
  const _ContatoFormCard();

  @override
  State<_ContatoFormCard> createState() => _ContatoFormCardState();
}

class _ContatoFormCardState extends State<_ContatoFormCard> {
  final _formKey = GlobalKey<FormState>();
  final _nomeCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _assuntoCtrl = TextEditingController();
  final _mensagemCtrl = TextEditingController();

  AutovalidateMode _autovalidate = AutovalidateMode.disabled;

  static final RegExp _emailRegex = RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$');

  @override
  void dispose() {
    _nomeCtrl.dispose();
    _emailCtrl.dispose();
    _assuntoCtrl.dispose();
    _mensagemCtrl.dispose();
    super.dispose();
  }

  String? _validateNome(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Informe seu nome.' : null;

  String? _validateEmail(String? v) {
    if (v == null || v.trim().isEmpty) return 'Informe seu e-mail.';
    if (!_emailRegex.hasMatch(v.trim())) return 'Digite um e-mail válido.';
    return null;
  }

  String? _validateAssunto(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Informe o assunto.' : null;

  String? _validateMensagem(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Escreva uma mensagem.' : null;

  void _enviar() {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) {
      setState(() => _autovalidate = AutovalidateMode.onUserInteraction);
      showBrandSnackBar(
        context,
        'Confira os campos destacados antes de enviar.',
        icon: Icons.info_outline,
      );
      return;
    }

    // Protótipo: sem backend/e-mail real. Apenas simula o envio.
    _formKey.currentState!.reset();
    _nomeCtrl.clear();
    _emailCtrl.clear();
    _assuntoCtrl.clear();
    _mensagemCtrl.clear();
    setState(() => _autovalidate = AutovalidateMode.disabled);

    showBrandSnackBar(
      context,
      'Mensagem enviada com sucesso! Obrigada por entrar em contato com a D’Vanille.',
      icon: Icons.favorite,
    );
  }

  InputDecoration _decoration(String hint) {
    OutlineInputBorder border(Color color, [double width = 1]) =>
        OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppRadius.md),
          borderSide: BorderSide(color: color, width: width),
        );

    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: Theme.of(context).brightness == Brightness.dark ? AppColors.darkSecondary : AppColors.cream,
      hintStyle: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.textMuted, fontSize: 14),
      errorStyle: TextStyle(
        color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong,
        fontSize: 12,
        fontWeight: FontWeight.w600,
      ),
      errorMaxLines: 2,
      border: border(Theme.of(context).brightness == Brightness.dark ? AppColors.darkBorder : AppColors.beige),
      enabledBorder: border(Theme.of(context).brightness == Brightness.dark ? AppColors.darkBorder : AppColors.beige),
      focusedBorder: border(Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.brown, 1.6),
      errorBorder: border(Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong, 1.3),
      focusedErrorBorder: border(Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong, 1.6),
    );
  }

  Widget _field({
    required TextEditingController controller,
    required String hint,
    required String? Function(String?) validator,
    TextInputType? keyboardType,
    TextInputAction action = TextInputAction.next,
    TextCapitalization capitalization = TextCapitalization.none,
    int maxLines = 1,
    int? minLines,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: action,
      textCapitalization: capitalization,
      maxLines: maxLines,
      minLines: minLines,
      validator: validator,
      autovalidateMode: _autovalidate,
      style: TextStyle(color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkText : AppColors.brownStrong, fontSize: 14.5),
      decoration: _decoration(hint),
    );
  }

  @override
  Widget build(BuildContext context) {
    final nome = _field(
      controller: _nomeCtrl,
      hint: 'Nome',
      validator: _validateNome,
      keyboardType: TextInputType.name,
      capitalization: TextCapitalization.words,
    );
    final email = _field(
      controller: _emailCtrl,
      hint: 'E-mail',
      validator: _validateEmail,
      keyboardType: TextInputType.emailAddress,
    );

    return DVanilleCard(
      padding: const EdgeInsets.fromLTRB(22, 24, 22, 24),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Envie uma mensagem',
              style: TextStyle(
                fontFamily: 'CreamCake',
                fontSize: 32,
                height: 1.1,
                color: Theme.of(context).brightness == Brightness.dark ? AppColors.darkTextSecondary : AppColors.brown,
              ),
            ),
            SizedBox(height: 18),
            LayoutBuilder(
              builder: (context, c) {
                if (c.maxWidth >= 420) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: nome),
                      SizedBox(width: 12),
                      Expanded(child: email),
                    ],
                  );
                }
                return Column(
                  children: [nome, SizedBox(height: 14), email],
                );
              },
            ),
            SizedBox(height: 14),
            _field(
              controller: _assuntoCtrl,
              hint: 'Assunto',
              validator: _validateAssunto,
              capitalization: TextCapitalization.sentences,
            ),
            SizedBox(height: 14),
            _field(
              controller: _mensagemCtrl,
              hint: 'Mensagem',
              validator: _validateMensagem,
              keyboardType: TextInputType.multiline,
              action: TextInputAction.newline,
              capitalization: TextCapitalization.sentences,
              maxLines: 6,
              minLines: 5,
            ),
            SizedBox(height: 22),
            ElevatedButton(
              onPressed: _enviar,
              child: Text('Enviar mensagem'),
            ),
          ],
        ),
      ),
    );
  }
}
