import 'package:flutter/foundation.dart';

enum DietaryRestriction {
  aplv,
  soja,
  oleaginosas,
  semAcucarAdicionado,
  semSalAdicionado,
  fodmap,
  lowCarb,
  semAditivosArtificiais,
  vegano,
  vegetariano,
  lactose,
  semGluten,
}

extension DietaryRestrictionX on DietaryRestriction {
  String get label {
    switch (this) {
      case DietaryRestriction.aplv:
        return 'Sem APLV';
      case DietaryRestriction.soja:
        return 'Sem Soja';
      case DietaryRestriction.oleaginosas:
        return 'Sem Oleaginosas';
      case DietaryRestriction.semAcucarAdicionado:
        return 'Sem Açúcar Adicionado';
      case DietaryRestriction.semSalAdicionado:
        return 'Sem Sal Adicionado';
      case DietaryRestriction.fodmap:
        return 'Low FODMAP';
      case DietaryRestriction.lowCarb:
        return 'Low Carb';
      case DietaryRestriction.semAditivosArtificiais:
        return 'Sem Aditivos Artificiais';
      case DietaryRestriction.vegano:
        return 'Vegano';
      case DietaryRestriction.vegetariano:
        return 'Vegetariano';
      case DietaryRestriction.lactose:
        return 'Sem lactose';
      case DietaryRestriction.semGluten:
        return 'Sem glúten';
    }
  }

  String get shortLabel => label;
}

enum ProductCategory { bolos, salgados, doces, sobremesasGeladas, bebidasQuentes, bebidasGeladas }

extension ProductCategoryX on ProductCategory {
  String get label {
    switch (this) {
      case ProductCategory.bolos:
        return 'Bolos';
      case ProductCategory.salgados:
        return 'Salgados';
      case ProductCategory.doces:
        return 'Doces';
      case ProductCategory.sobremesasGeladas:
        return 'Sobremesas Geladas';
      case ProductCategory.bebidasQuentes:
        return 'Bebidas Quentes';
      case ProductCategory.bebidasGeladas:
        return 'Bebidas Geladas';
    }
  }
}

class NutritionInfo {
  final int calorias;
  final double gorduraTotal;
  final double carboidratos;
  final double proteinas;
  final double sodio;
  final double gluten;

  const NutritionInfo({
    this.calorias = 0,
    this.gorduraTotal = 0,
    this.carboidratos = 0,
    this.proteinas = 0,
    this.sodio = 0,
    this.gluten = 0,
  });
}

class Product {
  final String id;
  String nome;
  String descricao;
  ProductCategory categoria;
  double preco;
  String imagem;
  String tamanho;
  NutritionInfo nutricao;
  List<String> ingredientes;
  List<String> alergenicos;
  Set<DietaryRestriction> restricoes;
  bool popular;
  bool emOferta;
  double? precoOferta;

  Product({
    required this.id,
    required this.nome,
    required this.descricao,
    required this.categoria,
    required this.preco,
    required this.imagem,
    this.tamanho = 'Único',
    this.nutricao = const NutritionInfo(),
    this.ingredientes = const [],
    this.alergenicos = const [],
    this.restricoes = const {},
    this.popular = false,
    this.emOferta = false,
    this.precoOferta,
  });

  bool isCompativelCom(DietaryRestriction restricao) =>
      !restricoes.contains(restricao);

  bool isCompativelComTodas(Set<DietaryRestriction> selecionadas) {
    if (selecionadas.isEmpty) return true;
    return selecionadas.every((r) => isCompativelCom(r));
  }
}

class CartItem {
  final Product produto;
  int quantidade;
  CartItem({required this.produto, this.quantidade = 1});

  double get precoUnitario =>
      produto.emOferta && produto.precoOferta != null ? produto.precoOferta! : produto.preco;

  double get subtotal => precoUnitario * quantidade;
}

enum TipoEntrega { retirada, delivery }

enum MetodoPagamento { dinheiro, cartaoCredito, cartaoDebito, pix, carteira }

extension MetodoPagamentoX on MetodoPagamento {
  String get label {
    switch (this) {
      case MetodoPagamento.dinheiro:
        return 'Dinheiro';
      case MetodoPagamento.cartaoCredito:
        return 'Cartão de crédito';
      case MetodoPagamento.cartaoDebito:
        return 'Cartão de débito';
      case MetodoPagamento.pix:
        return 'PIX';
      case MetodoPagamento.carteira:
        return 'Carteira digital';
    }
  }
}

enum StatusPedido {
  recebido,
  emPreparacao,
  prontoRetirada,
  saiuEntrega,
  entregue,
  retirado,
}

extension StatusPedidoX on StatusPedido {
  String get label {
    switch (this) {
      case StatusPedido.recebido:
        return 'Pedido recebido';
      case StatusPedido.emPreparacao:
        return 'Em preparação';
      case StatusPedido.prontoRetirada:
        return 'Pronto para retirada';
      case StatusPedido.saiuEntrega:
        return 'Saiu para entrega';
      case StatusPedido.entregue:
        return 'Entregue';
      case StatusPedido.retirado:
        return 'Retirado';
    }
  }
}

class Address {
  String id;
  String apelido;
  String cep;
  String rua;
  String numero;
  String complemento;
  String bairro;
  String cidade;
  String estado;
  bool principal;

  Address({
    required this.id,
    required this.apelido,
    required this.cep,
    required this.rua,
    required this.numero,
    this.complemento = '',
    required this.bairro,
    required this.cidade,
    required this.estado,
    this.principal = false,
  });

  String get enderecoResumido => '$rua, $numero${complemento.isNotEmpty ? ' - $complemento' : ''}';
  String get cidadeEstado => '$cidade - $estado';
}

class Order {
  final String id;
  final String numeroPedido;
  final DateTime data;
  final List<CartItem> produtos;
  final double subtotal;
  final double taxaEntrega;
  final double total;
  final TipoEntrega tipoEntrega;
  final Address? endereco;
  final MetodoPagamento metodoPagamento;
  StatusPedido status;
  String observacoes;

  Order({
    required this.id,
    required this.numeroPedido,
    required this.data,
    required this.produtos,
    required this.subtotal,
    required this.taxaEntrega,
    required this.total,
    required this.tipoEntrega,
    this.endereco,
    required this.metodoPagamento,
    this.status = StatusPedido.recebido,
    this.observacoes = '',
  });

  List<StatusPedido> get fluxoStatus => tipoEntrega == TipoEntrega.delivery
      ? const [
          StatusPedido.recebido,
          StatusPedido.emPreparacao,
          StatusPedido.prontoRetirada,
          StatusPedido.saiuEntrega,
          StatusPedido.entregue,
        ]
      : const [
          StatusPedido.recebido,
          StatusPedido.emPreparacao,
          StatusPedido.prontoRetirada,
          StatusPedido.retirado,
        ];
}

class GiftCard {
  final String codigo;
  final double valor;
  final DateTime validade;
  bool usado;
  GiftCard({
    required this.codigo,
    required this.valor,
    required this.validade,
    this.usado = false,
  });
}

class AppNotification {
  final String id;
  final String titulo;
  final String mensagem;
  final DateTime data;
  final String emoji;
  bool lida;
  AppNotification({
    required this.id,
    required this.titulo,
    required this.mensagem,
    required this.data,
    this.emoji = '🔔',
    this.lida = false,
  });
}

class AppUser {
  String nome;
  String email;
  String telefone;
  Set<DietaryRestriction> restricoes;
  AppUser({
    required this.nome,
    required this.email,
    this.telefone = '',
    Set<DietaryRestriction>? restricoes,
  }) : restricoes = restricoes ?? {};
}

@immutable
class IdGen {
  static int _seq = 1000;
  static String next(String prefix) => '$prefix${_seq++}';
}
