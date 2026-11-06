import 'package:flutter/material.dart';
import '../../models/models.dart';
import '../../state/app_state.dart';
import '../../theme/app_theme.dart';
import '../../widgets/dvanille_brand.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = AppState.instance;
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "D'Vanille Admin",
          style: TextStyle(
            fontFamily: 'CreamCake',
            fontSize: 40,
            color: AppColors.danger,
          )
        ),
        leading: IconButton(
          icon: const Icon(Icons.logout, color: AppColors.brownStrong),
          tooltip: 'Sair do modo admin',
          onPressed: () {
            state.logout();
            Navigator.pushNamedAndRemoveUntil(context, '/login', (r) => false);
          },
        ),
      ),
      body: ListenableBuilder(
        listenable: state,
        builder: (context, _) {
          return ListView(
            padding: const EdgeInsets.all(18),
            children: [
              const SectionTitle('Resumo'),
              GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.6,
                children: [
                  _stat('Produtos', '${state.products.length}', Icons.local_cafe_outlined),
                  _stat('Pedidos', '${state.orders.length}', Icons.receipt_long_outlined),
                  _stat('Ofertas', '${state.products.where((p) => p.emOferta).length}', Icons.local_offer_outlined),
                  _stat('Clientes', '48', Icons.people_outline),
                ],
              ),
              const SectionTitle('Gerenciar'),
              DVanilleCard(
                onTap: () => Navigator.pushNamed(context, '/admin-produtos'),
                child: const ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.inventory_2_outlined, color: AppColors.brownStrong),
                  title: Text('Produtos', style: TextStyle(color: AppColors.brownStrong, fontWeight: FontWeight.w600)),
                  trailing: Icon(Icons.chevron_right, color: AppColors.textMuted),
                ),
              ),
              const SizedBox(height: 10),
              DVanilleCard(
                onTap: () => Navigator.pushNamed(context, '/admin-pedidos'),
                child: const ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.assignment_outlined, color: AppColors.brownStrong),
                  title: Text('Pedidos', style: TextStyle(color: AppColors.brownStrong, fontWeight: FontWeight.w600)),
                  trailing: Icon(Icons.chevron_right, color: AppColors.textMuted),
                ),
              ),
              const SectionTitle('Pedidos recentes'),
              if (state.orders.isEmpty)
                const Text('Nenhum pedido registrado ainda.', style: TextStyle(color: AppColors.textMuted))
              else
                ...state.orders.take(5).map((o) => ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.circle, size: 10, color: AppColors.brown),
                      title: Text('${o.numeroPedido} — ${o.status.label}'),
                      trailing: Text('R\$ ${o.total.toStringAsFixed(2)}'),
                    )),
            ],
          );
        },
      ),
    );
  }

  Widget _stat(String label, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.beige.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(AppRadius.md),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.brown),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppColors.brownStrong)),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
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
                    Text(p.imagem, style: const TextStyle(fontSize: 26)),
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
