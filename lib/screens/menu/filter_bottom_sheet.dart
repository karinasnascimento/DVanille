import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../theme/app_theme.dart';

class MenuFilters {
  ProductCategory? categoria;
  Set<DietaryRestriction> restricoes;
  MenuFilters({this.categoria, Set<DietaryRestriction>? restricoes})
      : restricoes = restricoes ?? {};

  MenuFilters copy() => MenuFilters(categoria: categoria, restricoes: {...restricoes});
}

Future<MenuFilters?> showFilterBottomSheet(BuildContext context, MenuFilters current) {
  final isDark = Theme.of(context).brightness == Brightness.dark;
  return showModalBottomSheet<MenuFilters>(
    context: context,
    isScrollControlled: true,
    backgroundColor: isDark ? AppColors.darkSecondary : AppColors.cream,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
    ),
    builder: (context) => _FilterSheet(initial: current),
  );
}

class _FilterSheet extends StatefulWidget {
  final MenuFilters initial;
  const _FilterSheet({required this.initial});
  @override
  State<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends State<_FilterSheet> {
  late MenuFilters filters;

  @override
  void initState() {
    super.initState();
    filters = widget.initial.copy();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = isDark ? AppColors.darkButton : AppColors.brown;
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            const SizedBox(height: 10),
            Container(width: 40, height: 4, decoration: BoxDecoration(color: isDark ? AppColors.darkBorder : AppColors.beige, borderRadius: BorderRadius.circular(4))),
            const SizedBox(height: 14),
            Text('FILTRAR PRODUTOS', style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 4),
            Expanded(
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                children: [
                  const SectionTitleSmall('Categoria'),
                  RadioListTile<ProductCategory?>(
                    value: null,
                    groupValue: filters.categoria,
                    title: const Text('Todas'),
                    activeColor: accentColor,
                    contentPadding: EdgeInsets.zero,
                    onChanged: (v) => setState(() => filters.categoria = v),
                  ),
                  ...ProductCategory.values.map((cat) => RadioListTile<ProductCategory?>(
                        value: cat,
                        groupValue: filters.categoria,
                        title: Text(cat.label),
                        activeColor: accentColor,
                        contentPadding: EdgeInsets.zero,
                        onChanged: (v) => setState(() => filters.categoria = v),
                      )),
                  const SizedBox(height: 8),
                  const SectionTitleSmall('Restrições alimentares'),
                  ...DietaryRestriction.values.map((r) => CheckboxListTile(
                        value: filters.restricoes.contains(r),
                        title: Text(r.label, style: TextStyle(fontSize: 13.5, color: Theme.of(context).colorScheme.onSurface)),
                        activeColor: accentColor,
                        controlAffinity: ListTileControlAffinity.leading,
                        contentPadding: EdgeInsets.zero,
                        onChanged: (v) => setState(() {
                          if (v == true) {
                            filters.restricoes.add(r);
                          } else {
                            filters.restricoes.remove(r);
                          }
                        }),
                      )),
                  const SizedBox(height: 12),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => setState(() => filters = MenuFilters()),
                      child: const Text('LIMPAR'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => Navigator.pop(context, filters),
                      child: const Text('APLICAR FILTROS'),
                    ),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }
}

class SectionTitleSmall extends StatelessWidget {
  final String text;
  const SectionTitleSmall(this.text, {super.key});
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Padding(
      padding: const EdgeInsets.only(top: 14, bottom: 6),
      child: Text(
        text.toUpperCase(),
        style: TextStyle(
          fontWeight: FontWeight.w700,
          fontSize: 12.5,
          letterSpacing: 1,
          color: isDark ? AppColors.darkTextSecondary : AppColors.brownStrong,
        ),
      ),
    );
  }
}
