import 'package:flutter/material.dart';
import '../data/mock_data.dart';
import '../models/models.dart';

/// Estado global simples do protótipo (sem backend real).
/// Usa ChangeNotifier + ListenableBuilder (nativos do Flutter) — sem
/// dependências externas de gerenciamento de estado.
class AppState extends ChangeNotifier {
  AppState._internal() {
    products = MockData.buildProducts();
    addresses = [
      Address(
        id: 'a1',
        apelido: 'Casa',
        cep: '01310-100',
        rua: 'Rua Exemplo',
        numero: '123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        principal: true,
      ),
    ];
    notifications = [
      AppNotification(
        id: 'n1',
        titulo: 'Nova oferta',
        mensagem: 'Confira o combo da semana.',
        data: DateTime.now(),
        icone: Icons.card_giftcard,
      ),
    ];
  }

  static final AppState instance = AppState._internal();

  // ------------------------------------------------------------------
  // Autenticação (simulada)
  // ------------------------------------------------------------------
  bool isDarkMode = false;

  void setDarkMode(bool enabled) {
    if (isDarkMode == enabled) return;
    isDarkMode = enabled;
    notifyListeners();
  }

  bool isLoggedIn = false;
  bool isAdmin = false;
  AppUser user = AppUser(
    nome: 'Viviane Souza',
    email: 'viviane@email.com',
    telefone: '(11) 99999-0000',
  );

  String _senhaDemonstracao = '1234';

  void login({bool admin = false}) {
    isLoggedIn = true;
    isAdmin = admin;
    notifyListeners();
  }

  void logout() {
    isLoggedIn = false;
    isAdmin = false;
    notifyListeners();
  }

  // ------------------------------------------------------------------
  // Catálogo
  // ------------------------------------------------------------------
  late List<Product> products;

  void addProduct(Product p) {
    products.add(p);
    notifyListeners();
  }

  void updateProduct(Product p) {
    final idx = products.indexWhere((e) => e.id == p.id);
    if (idx != -1) products[idx] = p;
    notifyListeners();
  }

  void removeProduct(String id) {
    products.removeWhere((e) => e.id == id);
    notifyListeners();
  }

  // ------------------------------------------------------------------
  // Favoritos
  // ------------------------------------------------------------------
  final Set<String> favoriteIds = {};

  bool isFavorite(String productId) => favoriteIds.contains(productId);

  void toggleFavorite(String productId) {
    if (favoriteIds.contains(productId)) {
      favoriteIds.remove(productId);
    } else {
      favoriteIds.add(productId);
    }
    notifyListeners();
  }

  List<Product> get favoriteProducts =>
      products.where((p) => favoriteIds.contains(p.id)).toList();

  // ------------------------------------------------------------------
  // Carrinho
  // ------------------------------------------------------------------
  final List<CartItem> cartItems = [];

  double get cartSubtotal =>
      cartItems.fold(0, (sum, item) => sum + item.subtotal);

  int get cartCount => cartItems.fold(0, (sum, item) => sum + item.quantidade);

  void addToCart(Product product, {int quantidade = 1}) {
    final existing = cartItems.where((c) => c.produto.id == product.id);
    if (existing.isNotEmpty) {
      existing.first.quantidade += quantidade;
    } else {
      cartItems.add(CartItem(produto: product, quantidade: quantidade));
    }
    notifyListeners();
  }

  void incrementCartItem(CartItem item) {
    item.quantidade++;
    notifyListeners();
  }

  void decrementCartItem(CartItem item) {
    item.quantidade--;
    if (item.quantidade <= 0) {
      cartItems.remove(item);
    }
    notifyListeners();
  }

  void removeFromCart(CartItem item) {
    cartItems.remove(item);
    notifyListeners();
  }

  void clearCart() {
    cartItems.clear();
    notifyListeners();
  }

  // ------------------------------------------------------------------
  // Checkout em andamento (rascunho)
  // ------------------------------------------------------------------
  TipoEntrega tipoEntregaSelecionada = TipoEntrega.delivery;
  Address? enderecoSelecionado;
  MetodoPagamento? metodoPagamentoSelecionado;
  double? trocoPara;

  double get taxaEntregaAtual =>
      tipoEntregaSelecionada == TipoEntrega.delivery ? 5.0 : 0.0;

  void setTipoEntrega(TipoEntrega tipo) {
    tipoEntregaSelecionada = tipo;
    notifyListeners();
  }

  void setEnderecoSelecionado(Address address) {
    enderecoSelecionado = address;
    notifyListeners();
  }

  void setMetodoPagamento(MetodoPagamento metodo) {
    metodoPagamentoSelecionado = metodo;
    notifyListeners();
  }

  // ------------------------------------------------------------------
  // Endereços
  // ------------------------------------------------------------------
  late List<Address> addresses;

  Address? get enderecoPrincipal {
    if (addresses.isEmpty) return null;
    return addresses.firstWhere(
      (a) => a.principal,
      orElse: () => addresses.first,
    );
  }

  void addAddress(Address address) {
    if (addresses.isEmpty) address.principal = true;
    addresses.add(address);
    notifyListeners();
  }

  void updateAddress(Address address) {
    final idx = addresses.indexWhere((a) => a.id == address.id);
    if (idx != -1) addresses[idx] = address;
    notifyListeners();
  }

  void removeAddress(String id) {
    addresses.removeWhere((a) => a.id == id);
    notifyListeners();
  }

  void setEnderecoPrincipal(String id) {
    for (final a in addresses) {
      a.principal = a.id == id;
    }
    notifyListeners();
  }

  // ------------------------------------------------------------------
  // Pedidos
  // ------------------------------------------------------------------
  final List<Order> orders = [];

  int _orderSeq = 123;

  Order createOrder() {
    if (cartItems.isEmpty) {
      throw StateError('Não é possível criar um pedido com o carrinho vazio.');
    }

    final numero = '#${(_orderSeq++).toString().padLeft(6, '0')}';
    final order = Order(
      id: IdGen.next('o'),
      numeroPedido: numero,
      data: DateTime.now(),
      produtos: cartItems
          .map((c) => CartItem(produto: c.produto, quantidade: c.quantidade))
          .toList(),
      subtotal: cartSubtotal,
      taxaEntrega: taxaEntregaAtual,
      total: cartSubtotal + taxaEntregaAtual,
      tipoEntrega: tipoEntregaSelecionada,
      endereco: tipoEntregaSelecionada == TipoEntrega.delivery
          ? (enderecoSelecionado ?? enderecoPrincipal)
          : null,
      metodoPagamento: metodoPagamentoSelecionado ?? MetodoPagamento.pix,
    );

    orders.insert(0, order);
    cartItems.clear();
    resetCheckout();
    addNotification(
      titulo: 'Pedido realizado',
      mensagem: 'Seu pedido ${order.numeroPedido} foi recebido.',
      icone: Icons.receipt_long,
    );
    notifyListeners();
    return order;
  }

  void resetCheckout() {
    tipoEntregaSelecionada = TipoEntrega.delivery;
    enderecoSelecionado = null;
    metodoPagamentoSelecionado = null;
    trocoPara = null;
  }

  void advanceOrderStatus(Order order) {
    final flow = order.fluxoStatus;
    final idx = flow.indexOf(order.status);
    if (idx != -1 && idx < flow.length - 1) {
      order.status = flow[idx + 1];
      addNotification(
        titulo: 'Atualização do pedido',
        mensagem: 'Pedido ${order.numeroPedido}: ${order.status.label}.',
        icone: Icons.local_shipping_outlined,
      );
      notifyListeners();
    }
  }

  void setOrderStatus(Order order, StatusPedido status) {
    order.status = status;
    notifyListeners();
  }

  List<Order> get ongoingOrders => orders
      .where(
        (o) =>
            o.status != StatusPedido.entregue &&
            o.status != StatusPedido.retirado,
      )
      .toList();

  List<Order> get historyOrders => orders
      .where(
        (o) =>
            o.status == StatusPedido.entregue ||
            o.status == StatusPedido.retirado,
      )
      .toList();

  // ------------------------------------------------------------------
  // Vale-presente
  // ------------------------------------------------------------------
  final List<GiftCard> giftCards = [];

  GiftCard buyGiftCard(double valor) {
    final code =
        'DV-${DateTime.now().year}-${IdGen.next('').substring(0, 4).toUpperCase()}';
    final card = GiftCard(
      codigo: code,
      valor: valor,
      validade: DateTime.now().add(const Duration(days: 365)),
    );
    giftCards.add(card);
    notifyListeners();
    return card;
  }

  // ------------------------------------------------------------------
  // Notificações
  // ------------------------------------------------------------------
  late List<AppNotification> notifications;

  int get unreadNotifications => notifications.where((n) => !n.lida).length;

  void addNotification({
    required String titulo,
    required String mensagem,
    required IconData icone,
  }) {
    notifications.insert(
      0,
      AppNotification(
        id: IdGen.next('n'),
        titulo: titulo,
        mensagem: mensagem,
        data: DateTime.now(),
        icone: icone,
      ),
    );
  }

  void markAllNotificationsRead() {
    for (final n in notifications) {
      n.lida = true;
    }
    notifyListeners();
  }

  // ------------------------------------------------------------------
  // Perfil / restrições do usuário
  // ------------------------------------------------------------------
  void updateProfile({
    required String nome,
    required String email,
    required String telefone,
  }) {
    user.nome = nome;
    user.email = email;
    user.telefone = telefone;
    notifyListeners();
  }

  bool atualizarSenhaDemonstracao(String novaSenha) {
    if (novaSenha.length < 4) {
      return false;
    }

    _senhaDemonstracao = novaSenha;
    notifyListeners();
    return true;
  }

  bool validarSenhaDemonstracao(String senha) {
    return senha == _senhaDemonstracao;
  }

  void updateUserRestrictions(Set<DietaryRestriction> restrictions) {
    user.restricoes = restrictions;
    notifyListeners();
  }
}
