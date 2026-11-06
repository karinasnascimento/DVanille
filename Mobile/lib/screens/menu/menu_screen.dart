import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';
import '../../widgets/product_widgets.dart';
import 'filter_bottom_sheet.dart';
import 'product_details_screen.dart';

class MenuScreen extends StatefulWidget {
  final ProductCategory? initialCategory;
  const MenuScreen({super.key, this.initialCategory});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen> {
  final _searchCtrl = TextEditingController();
  MenuFilters filters = MenuFilters();
  bool _initialized = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_initialized) {
      final args = ModalRoute.of(context)?.settings.arguments;
      if (args is ProductCategory) {
        filters.categoria = args;
      } else if (widget.initialCategory != null) {
        filters.categoria = widget.initialCategory;
      }
      filters.restricoes.addAll(AppState.instance.user.restricoes);
      _initialized = true;
    }
  }

  List<Product> _filtered(List<Product> all) {
    final query = _searchCtrl.text.trim().toLowerCase();
    return all.where((p) {
      final matchesQuery = query.isEmpty ||
          p.nome.toLowerCase().contains(query) ||
          p.descricao.toLowerCase().contains(query) ||
          p.categoria.label.toLowerCase().contains(query);
      final matchesCategory = filters.categoria == null || p.categoria == filters.categoria;
      final matchesRestrictions = p.isCompativelComTodas(filters.restricoes);
      return matchesQuery && matchesCategory && matchesRestrictions;
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Cardápio'),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final results = _filtered(state.products);
          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: _searchCtrl,
                      onChanged: (_) => setState(() {}),
                      decoration: InputDecoration(
                        hintText: 'Buscar produto...',
                        prefixIcon: const Icon(Icons.search, size: 20),
                        suffixIcon: _searchCtrl.text.isEmpty
                            ? null
                            : IconButton(
                                icon: const Icon(Icons.close, size: 18),
                                onPressed: () => setState(() => _searchCtrl.clear()),
                              ),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.pill)),
                        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppRadius.pill), borderSide: const BorderSide(color: AppColors.beige)),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(44)),
                            onPressed: () async {
                              final result = await showFilterBottomSheet(context, filters);
                              if (result != null) setState(() => filters = result);
                            },
                            icon: const Icon(Icons.tune, size: 18),
                            label: const Text('Categoria e restrições'),
                          ),
                        ),
                      ],
                    ),
                    if (filters.categoria != null || filters.restricoes.isNotEmpty) ...[
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          if (filters.categoria != null)
                            RestrictionChip(
                              label: filters.categoria!.label,
                              onRemove: () => setState(() => filters.categoria = null),
                            ),
                          ...filters.restricoes.map((r) => RestrictionChip(
                                label: r.shortLabel,
                                onRemove: () => setState(() => filters.restricoes.remove(r)),
                              )),
                        ],
                      ),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton(
                          onPressed: () => setState(() => filters = MenuFilters()),
                          child: const Text('LIMPAR FILTROS'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Expanded(
                child: results.isEmpty
                    ? EmptyState(
                        icon: Icons.search_off,
                        message: 'Nenhum produto encontrado.',
                        subtitle: 'Tente remover alguns filtros.',
                        buttonLabel: 'LIMPAR FILTROS',
                        onButtonTap: () {
                          setState(() {
                            filters = MenuFilters();
                            _searchCtrl.clear();
                          });
                        },
                      )
                    : GridView.builder(
                        padding: const EdgeInsets.fromLTRB(18, 14, 18, 24),
                        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          mainAxisSpacing: 14,
                          crossAxisSpacing: 14,
                          childAspectRatio: 0.68,
                        ),
                        itemCount: results.length,
                        itemBuilder: (context, i) {
                          final p = results[i];
                          return ProductCard(
                            product: p,
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(builder: (_) => ProductDetailsScreen(product: p)),
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}
