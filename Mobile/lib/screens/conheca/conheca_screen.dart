import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

const String _kCafeteriaImageAsset = 'assets/fachada.png';

class ConhecaScreen extends StatelessWidget {
  const ConhecaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const DVanilleHeader(
        showBack: true,
        actions: [
          Padding(
            padding: EdgeInsets.only(right: 14),
            child: BowDecoration(size: 28),
          ),
        ],
      ),
      body: Column(
        children: [
          Divider(height: 1),
          Expanded(
            child: SingleChildScrollView(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 600),
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(22, 28, 22, 48),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _PurposeHeader(),
                        SizedBox(height: 22),
                        _InstitutionalText(),
                        SizedBox(height: 28),
                        _CafeteriaImage(),
                        SizedBox(height: 28),
                        _HighlightQuote(),
                        SizedBox(height: 40),
                        _BeliefsSection(),
                        SizedBox(height: 22),
                        _Address(),
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

class _PurposeHeader extends StatelessWidget {
  const _PurposeHeader();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Nosso propósito',
          style: TextStyle(
            fontFamily: 'CreamCake',
            fontSize: 42,
            height: 1.1,
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.darkHighlight
                : AppColors.danger,
          ),
        ),
        SizedBox(height: 10),
        Text(
          'Uma experiência mais segura, acessível e acolhedora!',
          style: TextStyle(
            fontStyle: FontStyle.italic,
            fontSize: 17,
            fontWeight: FontWeight.w600,
            height: 1.35,
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.darkText
                : AppColors.brownStrong,
          ),
        ),
      ],
    );
  }
}

class _InstitutionalText extends StatelessWidget {
  const _InstitutionalText();

  static const List<String> _paragraphs = [
    'A D’Vanille nasceu do desejo de unir gastronomia, tecnologia e bem-estar, '
        'Buscamos tornar a experiência de se alimentar fora de casa mais segura e '
        'sem abrir mão do sabor e acolhedora para pessoas com restrições alimentares'
        'da beleza de cada receita.',
    'Acreditamos que todo mundo merece sentar à mesa, ler um cardápio com clareza'
        'e escolher com confiança. Por isso, cada produto traz ingredientes, informações'
        'nutricionais e indicação de restrições de forma visual e simples.',
  ];

  @override
  Widget build(BuildContext context) {
    final style = TextStyle(
      fontSize: 15.5,
      height: 1.6,
      color: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkText
          : AppColors.brownStrong,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (int i = 0; i < _paragraphs.length; i++) ...[
          if (i > 0) SizedBox(height: 16),
          Text(_paragraphs[i], style: style),
        ],
      ],
    );
  }
}

class _CafeteriaImage extends StatelessWidget {
  const _CafeteriaImage();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      image: true,
      label: "Foto da cafeteria D'Vanille",
      child: Container(
        width: double.infinity,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.darkBorder
                : AppColors.beige,
            width: 1.3,
          ),
        ),
        child: AspectRatio(
          aspectRatio: 4 / 3,
          child: Image.asset(
            _kCafeteriaImageAsset,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => const _ImagePlaceholder(),
          ),
        ),
      ),
    );
  }
}

class _ImagePlaceholder extends StatelessWidget {
  const _ImagePlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Theme.of(context).brightness == Brightness.dark
          ? AppColors.darkSurface
          : AppColors.beige.withValues(alpha: 0.35),
      alignment: Alignment.center,
      padding: const EdgeInsets.all(16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          BowDecoration(size: 48),
          SizedBox(height: 10),
          Text(
            'Foto da cafeteria',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkTextSecondary
                  : AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _HighlightQuote extends StatelessWidget {
  const _HighlightQuote();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 28),
      decoration: BoxDecoration(
        color: Theme.of(context).brightness == Brightness.dark
            ? AppColors.darkSecondary
            : AppColors.pink.withValues(alpha: 0.55),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(
          color: Theme.of(context).brightness == Brightness.dark
              ? AppColors.darkHighlight
              : AppColors.pink,
        ),
      ),
      child: Column(
        children: [
          SizedBox(height: 7),
          Text(
            'Na D’Vanille, inclusão também faz parte da experiência.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 21,
              fontWeight: FontWeight.w600,
              height: 1.35,
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

class _Belief {
  final IconData icon;
  final String title;
  final String description;
  const _Belief(this.icon, this.title, this.description);
}

class _BeliefsSection extends StatelessWidget {
  const _BeliefsSection();

  static const List<_Belief> _beliefs = [
    _Belief(
      Icons.volunteer_activism_outlined,
      'Inclusão',
      'Um espaço pensado para acolher diferentes necessidades.',
    ),
    _Belief(
      Icons.smartphone_outlined,
      'Tecnologia',
      'Informação e recursos digitais para facilitar escolhas.',
    ),
    _Belief(
      Icons.bakery_dining_outlined,
      'Sabor',
      'Receitas bonitas, saborosas e feitas com carinho.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'O que acreditamos',
          style: TextStyle(
            fontFamily: 'CreamCake',
            fontSize: 32,
            height: 1.1,
            color: Theme.of(context).brightness == Brightness.dark
                ? AppColors.darkTextSecondary
                : AppColors.brown,
          ),
        ),
        SizedBox(height: 16),
        for (int i = 0; i < _beliefs.length; i++) ...[
          if (i > 0) SizedBox(height: 12),
          _BeliefTile(belief: _beliefs[i]),
        ],
      ],
    );
  }
}

class _BeliefTile extends StatelessWidget {
  final _Belief belief;
  const _BeliefTile({required this.belief});

  @override
  Widget build(BuildContext context) {
    return DVanilleCard(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkHighlight.withValues(alpha: 0.16)
                  : AppColors.pink.withValues(alpha: 0.45),
              shape: BoxShape.circle,
            ),
            child: Icon(
              belief.icon,
              size: 22,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkTextSecondary
                  : AppColors.brown,
            ),
          ),
          SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  belief.title.toUpperCase(),
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    letterSpacing: 1.1,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.darkText
                        : AppColors.brownStrong,
                  ),
                ),
                SizedBox(height: 6),
                Text(
                  belief.description,
                  style: TextStyle(
                    fontSize: 14.5,
                    height: 1.45,
                    color: Theme.of(context).brightness == Brightness.dark
                        ? AppColors.darkText
                        : AppColors.brownStrong,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Address extends StatelessWidget {
  const _Address();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Column(
        children: [
          Divider(),
          SizedBox(height: 28),

          Text(
            'Endereço',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkText
                  : AppColors.brownStrong,
            ),
          ),

          SizedBox(height: 8),

          Text(
            'Rua das Baunilhas, 245 — Jardim das Flores, São Paulo/SP',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontStyle: FontStyle.italic,
              fontSize: 15.5,
              height: 1.4,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkTextSecondary
                  : AppColors.brown,
            ),
          ),

          SizedBox(height: 24),

          Text(
            'Horário',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkText
                  : AppColors.brownStrong,
            ),
          ),

          SizedBox(height: 8),

          Text(
            'Terça a Sexta, 09h–20h · Sábado e Domingo, 10h–21h · Segunda, fechado',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontStyle: FontStyle.italic,
              fontSize: 15.5,
              height: 1.4,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkTextSecondary
                  : AppColors.brown,
            ),
          ),
        ],
      ),
    );
  }
}
