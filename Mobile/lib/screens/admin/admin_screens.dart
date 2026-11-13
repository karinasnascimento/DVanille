import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';
import '../../widgets/product_widgets.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  static const int _reservasDemonstracao = 1;
  static const int _usuariosDemonstracao = 1;

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Dashboard',
          style: TextStyle(
            fontFamily: 'CreamCake',
            fontSize: 36,
            color: AppColors.danger,
          ),
        ),
        leading: Builder(
          builder: (drawerContext) => IconButton(
            icon: Icon(
              Icons.menu,
              color: Theme.of(context).brightness == Brightness.dark
                  ? AppColors.darkText
                  : AppColors.brownStrong,
            ),
            tooltip: 'Abrir menu',
            onPressed: () => Scaffold.of(drawerContext).openDrawer(),
          ),
        ),
      ),
      drawer: const _AdminDrawer(),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          final pedidosRecentes = state.orders.take(3).toList();

          return LayoutBuilder(
            builder: (context, constraints) {
              final isWide = constraints.maxWidth >= 650;
              final crossAxisCount = isWide ? 4 : 2;

              return ListView(
                padding: const EdgeInsets.fromLTRB(18, 12, 18, 28),
                children: [
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: crossAxisCount,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: isWide ? 1.55 : 1.45,
                    children: [
                      _DashboardStatCard(
                        value: '${state.products.length}',
                        label: 'Produtos cadastrados',
                        icon: Icons.inventory_2_rounded,
                        accent: AppColors.pink,
                      ),
                      _DashboardStatCard(
                        value: '${state.orders.length}',
                        label: 'Pedidos realizados',
                        icon: Icons.receipt_long_rounded,
                        accent: AppColors.beige,
                      ),
                      const _DashboardStatCard(
                        value: '$_reservasDemonstracao',
                        label: 'Reservas',
                        icon: Icons.calendar_month_rounded,
                        accent: AppColors.pink,
                      ),
                      const _DashboardStatCard(
                        value: '$_usuariosDemonstracao',
                        label: 'Usuários',
                        icon: Icons.people_rounded,
                        accent: AppColors.beige,
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),
                  if (isWide)
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _RecentOrdersCard(orders: pedidosRecentes),
                        ),
                        const SizedBox(width: 14),
                        const Expanded(child: _RecentReservationsCard()),
                      ],
                    )
                  else ...[
                    _RecentOrdersCard(orders: pedidosRecentes),
                    const SizedBox(height: 14),
                    const _RecentReservationsCard(),
                  ],
                  const SizedBox(height: 12),
                  const Center(
                    child: Text(
                      'Painel administrativo • Somente visualização',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: AppColors.danger,
                        fontSize: 11,
                      ),
                    ),
                  ),
                ],
              );
            },
          );
        },
      ),
    );
  }
}

class _AdminDrawer extends StatelessWidget {
  const _AdminDrawer();

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Drawer(
      backgroundColor: isDark ? AppColors.darkSecondary : AppColors.cream,
      child: SafeArea(
        child: ListenableBuilder(
          listenable: state,
          builder: (context, _) {
            final darkMode = state.isDarkMode;
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(22, 28, 22, 22),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(
                        Icons.admin_panel_settings_rounded,
                        size: 34,
                        color: isDark ? AppColors.darkHighlight : AppColors.brown,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        "D'Vanille Admin",
                        style: TextStyle(
                          fontFamily: 'CreamCake',
                          fontSize: 29,
                          color: isDark ? AppColors.darkText : AppColors.brownStrong,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Configurações',
                        style: TextStyle(
                          fontSize: 13,
                          color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
                Divider(
                  height: 1,
                  color: isDark ? AppColors.darkBorder : AppColors.beige,
                ),
                SwitchListTile(
                  secondary: Icon(
                    darkMode ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
                    color: isDark ? AppColors.darkHighlight : AppColors.brown,
                  ),
                  title: Text(
                    'Modo noturno',
                    style: TextStyle(
                      color: isDark ? AppColors.darkText : AppColors.brownStrong,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  subtitle: Text(
                    darkMode ? 'Ativado' : 'Desativado',
                    style: TextStyle(
                      color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted,
                      fontSize: 12,
                    ),
                  ),
                  value: darkMode,
                  activeThumbColor: isDark ? AppColors.darkButton : AppColors.brown,
                  onChanged: (enabled) => state.setDarkMode(enabled),
                ),
                const Spacer(),
                Divider(
                  height: 1,
                  color: isDark ? AppColors.darkBorder : AppColors.beige,
                ),
                ListTile(
                  leading: Icon(
                    Icons.logout,
                    color: isDark ? AppColors.darkHighlight : AppColors.danger,
                  ),
                  title: Text(
                    'Sair',
                    style: TextStyle(
                      color: isDark ? AppColors.darkText : AppColors.brownStrong,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  onTap: () {
                    Navigator.pop(context);
                    state.logout();
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      '/login',
                      (route) => false,
                    );
                  },
                ),
                const SizedBox(height: 12),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _DashboardStatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color accent;

  const _DashboardStatCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.accent,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.beige.withValues(alpha: 0.65),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.brownStrong.withValues(alpha: 0.045),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Align(
            alignment: Alignment.topRight,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: accent.withValues(alpha: 0.35),
                borderRadius: BorderRadius.circular(13),
              ),
              child: Icon(icon, color: isDark ? AppColors.darkHighlight : AppColors.brown, size: 22),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: TextStyle(
                  color: isDark ? AppColors.darkText : AppColors.brownStrong,
                  fontSize: 30,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: isDark ? AppColors.darkTextSecondary : AppColors.brown,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RecentOrdersCard extends StatelessWidget {
  final List<Order> orders;

  const _RecentOrdersCard({required this.orders});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return _DashboardSectionCard(
      title: 'Pedidos recentes',
      icon: Icons.shopping_bag_rounded,
      child: orders.isEmpty
          ? const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Text(
                'Nenhum pedido registrado ainda.',
                style: TextStyle(color: AppColors.textMuted, fontSize: 13),
              ),
            )
          : Column(
              children: [
                for (var index = 0; index < orders.length; index++) ...[
                  if (index > 0)
                    Divider(
                      height: 18,
                      color: isDark
                          ? AppColors.darkBorder
                          : AppColors.beige.withValues(alpha: 0.75),
                    ),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              orders[index].numeroPedido,
                              style: TextStyle(
                                color: isDark ? AppColors.darkText : AppColors.brownStrong,
                                fontWeight: FontWeight.w700,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${orders[index].data.day.toString().padLeft(2, '0')}/'
                              '${orders[index].data.month.toString().padLeft(2, '0')}/'
                              '${orders[index].data.year} • '
                              '${orders[index].status.label}',
                              style: TextStyle(
                                color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'R\$ ${orders[index].total.toStringAsFixed(2).replaceAll('.', ',')}',
                        style: TextStyle(
                          color: isDark ? AppColors.darkText : AppColors.brownStrong,
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
    );
  }
}

class _RecentReservationsCard extends StatelessWidget {
  const _RecentReservationsCard();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return _DashboardSectionCard(
      title: 'Reservas recentes',
      icon: Icons.event_available_rounded,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Reserva demonstrativa',
                  style: TextStyle(
                    color: isDark ? AppColors.darkText : AppColors.brownStrong,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  '15/09/2026',
                  style: TextStyle(
                    color: isDark ? AppColors.darkTextSecondary : AppColors.textMuted,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          SizedBox(width: 8),
          _ReservationStatusLabel(),
        ],
      ),
    );
  }
}

class _ReservationStatusLabel extends StatelessWidget {
  const _ReservationStatusLabel();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: const Color(0xFFE5F0E1),
        borderRadius: BorderRadius.circular(30),
      ),
      child: const Text(
        'Confirmada',
        style: TextStyle(
          color: Color(0xFF477447),
          fontWeight: FontWeight.w600,
          fontSize: 11,
        ),
      ),
    );
  }
}

class _DashboardSectionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Widget child;

  const _DashboardSectionCard({
    required this.title,
    required this.icon,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkSurface : AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.beige.withValues(alpha: 0.65),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.brownStrong.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(9),
                decoration: BoxDecoration(
                  color: AppColors.pink.withValues(alpha: 0.35),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: isDark ? AppColors.darkHighlight : AppColors.brown, size: 20),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: TextStyle(
                    color: isDark ? AppColors.darkText : AppColors.brownStrong,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(color: AppColors.beige.withValues(alpha: 0.8), height: 1),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class AdminProductsScreen extends StatelessWidget {
  const AdminProductsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Produtos', showBack: true, showMark: false),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.brown,
        onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminProductFormScreen())),
        child: const Icon(Icons.add),
      ),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          return ListView.separated(
            padding: const EdgeInsets.all(18),
            itemCount: state.products.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final p = state.products[i];
              return DVanilleCard(
                child: Row(
                  children: [
                    ClipRRect(borderRadius: BorderRadius.circular(8), child: ProductImage(source: p.imagem, width: 48, height: 48, fallbackFontSize: 26)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p.nome, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.brownStrong)),
                          Text('${p.categoria.label} · R\$ ${p.preco.toStringAsFixed(2)}',
                              style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.edit_outlined, size: 20, color: AppColors.brown),
                      onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AdminProductFormScreen(product: p))),
                    ),
                    IconButton(
                      icon: const Icon(Icons.delete_outline, size: 20, color: AppColors.danger),
                      onPressed: () => state.removeProduct(p.id),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}

class AdminProductFormScreen extends StatefulWidget {
  final Product? product;
  const AdminProductFormScreen({super.key, this.product});

  @override
  State<AdminProductFormScreen> createState() => _AdminProductFormScreenState();
}

class _AdminProductFormScreenState extends State<AdminProductFormScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _nomeCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _precoCtrl;
  late final TextEditingController _tamanhoCtrl;
  late final TextEditingController _ingredientesCtrl;
  late final TextEditingController _calCtrl, _gordCtrl, _carbCtrl, _protCtrl, _sodioCtrl, _glutenCtrl;
  ProductCategory _categoria = ProductCategory.doces;
  final Set<DietaryRestriction> _restricoes = {};

  @override
  void initState() {
    super.initState();
    final p = widget.product;
    _nomeCtrl = TextEditingController(text: p?.nome ?? '');
    _descCtrl = TextEditingController(text: p?.descricao ?? '');
    _precoCtrl = TextEditingController(text: p != null ? p.preco.toStringAsFixed(2) : '');
    _tamanhoCtrl = TextEditingController(text: p?.tamanho ?? 'Unidade');
    _ingredientesCtrl = TextEditingController(text: p?.ingredientes.join(', ') ?? '');
    _calCtrl = TextEditingController(text: p?.nutricao.calorias.toString() ?? '0');
    _gordCtrl = TextEditingController(text: p?.nutricao.gorduraTotal.toString() ?? '0');
    _carbCtrl = TextEditingController(text: p?.nutricao.carboidratos.toString() ?? '0');
    _protCtrl = TextEditingController(text: p?.nutricao.proteinas.toString() ?? '0');
    _sodioCtrl = TextEditingController(text: p?.nutricao.sodio.toString() ?? '0');
    _glutenCtrl = TextEditingController(text: p?.nutricao.gluten.toString() ?? '0');
    if (p != null) {
      _categoria = p.categoria;
      _restricoes.addAll(p.restricoes);
    }
  }

  @override
  Widget build(BuildContext context) {
    final editing = widget.product != null;
    return Scaffold(
      appBar: DVanilleHeader(title: editing ? 'Editar produto' : 'Cadastrar produto', showBack: true, showMark: false),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _field(_nomeCtrl, 'Nome', required: true),
              _field(_descCtrl, 'Descrição', maxLines: 3, required: true),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<ProductCategory>(
                      initialValue: _categoria,
                      items: ProductCategory.values
                          .map((c) => DropdownMenuItem(value: c, child: Text(c.label)))
                          .toList(),
                      onChanged: (v) => setState(() => _categoria = v!),
                      decoration: const InputDecoration(labelText: 'Categoria'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: _field(_tamanhoCtrl, 'Tamanho/volume')),
                ],
              ),
              const SizedBox(height: 6),
              _field(_precoCtrl, 'Preço (R\$)', keyboardType: TextInputType.number, required: true),
              const SectionTitle('Imagem'),
              Container(
                height: 90,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.beige.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  border: Border.all(color: AppColors.beige, style: BorderStyle.solid),
                ),
                child: const Text('Imagem do produto (emoji representativo)', style: TextStyle(color: AppColors.textMuted)),
              ),
              const SectionTitle('Informações nutricionais'),
              Row(
                children: [
                  Expanded(child: _field(_calCtrl, 'kcal', keyboardType: TextInputType.number)),
                  const SizedBox(width: 8),
                  Expanded(child: _field(_gordCtrl, 'Gordura (g)', keyboardType: TextInputType.number)),
                  const SizedBox(width: 8),
                  Expanded(child: _field(_carbCtrl, 'Carb. (g)', keyboardType: TextInputType.number)),
                ],
              ),
              Row(
                children: [
                  Expanded(child: _field(_protCtrl, 'Prot. (g)', keyboardType: TextInputType.number)),
                  const SizedBox(width: 8),
                  Expanded(child: _field(_sodioCtrl, 'Sódio (mg)', keyboardType: TextInputType.number)),
                  const SizedBox(width: 8),
                  Expanded(child: _field(_glutenCtrl, 'Glúten (g)', keyboardType: TextInputType.number)),
                ],
              ),
              const SectionTitle('Ingredientes (separados por vírgula)'),
              _field(_ingredientesCtrl, 'Ex: Farinha, Ovos, Leite'),
              const SectionTitle('Restrições associadas'),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: DietaryRestriction.values.map((r) {
                  final sel = _restricoes.contains(r);
                  return FilterChip(
                    label: Text(r.shortLabel, style: const TextStyle(fontSize: 11.5)),
                    selected: sel,
                    selectedColor: AppColors.pink,
                    onSelected: (v) => setState(() {
                      if (v) {
                        _restricoes.add(r);
                      } else {
                        _restricoes.remove(r);
                      }
                    }),
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _save,
                child: Text(editing ? 'SALVAR ALTERAÇÕES' : 'CRIAR PRODUTO'),
              ),
              const SizedBox(height: 10),
            ],
          ),
        ),
      ),
    );
  }

  void _save() {
    if (!_formKey.currentState!.validate()) return;
    final preco = double.tryParse(_precoCtrl.text.replaceAll(',', '.')) ?? 0;
    final nutricao = NutritionInfo(
      calorias: int.tryParse(_calCtrl.text) ?? 0,
      gorduraTotal: double.tryParse(_gordCtrl.text) ?? 0,
      carboidratos: double.tryParse(_carbCtrl.text) ?? 0,
      proteinas: double.tryParse(_protCtrl.text) ?? 0,
      sodio: double.tryParse(_sodioCtrl.text) ?? 0,
      gluten: double.tryParse(_glutenCtrl.text) ?? 0,
    );
    final ingredientes = _ingredientesCtrl.text.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();

    final state = AppState.instance;
    if (widget.product == null) {
      state.addProduct(Product(
        id: IdGen.next('p'),
        nome: _nomeCtrl.text,
        descricao: _descCtrl.text,
        categoria: _categoria,
        preco: preco,
        imagem: _emojiFor(_categoria),
        tamanho: _tamanhoCtrl.text,
        nutricao: nutricao,
        ingredientes: ingredientes,
        restricoes: {..._restricoes},
      ));
      showBrandSnackBar(context, 'Produto criado com sucesso!');
    } else {
      final p = widget.product!;
      p.nome = _nomeCtrl.text;
      p.descricao = _descCtrl.text;
      p.categoria = _categoria;
      p.preco = preco;
      p.tamanho = _tamanhoCtrl.text;
      p.nutricao = nutricao;
      p.ingredientes = ingredientes;
      p.restricoes = {..._restricoes};
      state.updateProduct(p);
      showBrandSnackBar(context, 'Produto atualizado com sucesso!');
    }
    Navigator.pop(context);
  }

  String _emojiFor(ProductCategory c) {
    switch (c) {
      case ProductCategory.bolos:
        return '🍰';
      case ProductCategory.salgados:
        return '🥪';
      case ProductCategory.doces:
        return '🍬';
      case ProductCategory.sobremesasGeladas:
        return '🍨';
      case ProductCategory.bebidasQuentes:
        return '☕';
      case ProductCategory.bebidasGeladas:
        return '🥤';
    }
  }

  Widget _field(TextEditingController ctrl, String label,
      {TextInputType? keyboardType, int maxLines = 1, bool required = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        maxLines: maxLines,
        decoration: InputDecoration(hintText: label),
        validator: required ? (v) => (v == null || v.isEmpty) ? 'Campo obrigatório' : null : null,
      ),
    );
  }
}

class AdminOrdersScreen extends StatelessWidget {
  const AdminOrdersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: const DVanilleHeader(title: 'Pedidos', showBack: true, showMark: false),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          if (state.orders.isEmpty) {
            return const EmptyState(icon: Icons.assignment_outlined, message: 'Nenhum pedido registrado ainda.');
          }
          return ListView.separated(
            padding: const EdgeInsets.all(18),
            itemCount: state.orders.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, i) {
              final o = state.orders[i];
              return DVanilleCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(o.numeroPedido, style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.brownStrong)),
                        Text('R\$ ${o.total.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.w700)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    DropdownButton<StatusPedido>(
                      value: o.status,
                      isExpanded: true,
                      items: o.fluxoStatus
                          .map((s) => DropdownMenuItem(value: s, child: Text(s.label)))
                          .toList(),
                      onChanged: (v) {
                        if (v != null) state.setOrderStatus(o, v);
                      },
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
