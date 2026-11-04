# D’Vanille — Aplicativo Flutter

Protótipo navegável de e-commerce para a cafeteria boutique **D’Vanille**, desenvolvido com Flutter e Dart como parte de um projeto de Trabalho de Conclusão de Curso (TCC).

A proposta é apresentar uma experiência digital de cafeteria com cardápio, informações dos produtos e recursos de compra simulados, considerando diferentes restrições alimentares. O projeto utiliza dados de demonstração e não possui integração com um servidor ou banco de dados remoto.

## Tecnologias utilizadas

- **Flutter** — framework de desenvolvimento da interface.
- **Dart** — linguagem de programação.
- **ChangeNotifier** — gerenciamento do estado da aplicação.
- **Material Design** — componentes de interface do Flutter.

## Pré-requisitos

Antes de executar o projeto, instale e configure:

- Flutter SDK compatível com a versão indicada em `pubspec.yaml`;
- Dart SDK (incluído no Flutter);
- Visual Studio Code ou Android Studio, opcionalmente, como ambiente de desenvolvimento;
- Um dispositivo ou emulador compatível. Para executar no navegador, configure o Chrome para Flutter Web.

Para verificar a instalação do Flutter, execute:

```bash
flutter doctor
```

## Como executar

1. Abra um terminal na pasta raiz do projeto, onde está o arquivo `pubspec.yaml`.
2. Instale as dependências:

   ```bash
   flutter pub get
   ```

3. Inicie o aplicativo:

   ```bash
   flutter run
   ```

Para executar especificamente no Chrome, se o suporte a Flutter Web estiver configurado:

```bash
flutter run -d chrome
```

## Acesso de demonstração

O aplicativo possui fluxo de autenticação demonstrativo, sem validação de credenciais por um servidor:

- Para acessar como cliente, use o fluxo de login disponível na tela.
- Para abrir a área administrativa, informe `admin@dvanille.com` no campo de e-mail.
- No protótipo, a senha não é validada por um serviço de autenticação real.

**Importante:** essas credenciais servem apenas para demonstração. Não utilize dados pessoais ou senhas reais.

## Funcionalidades do protótipo

- **Autenticação demonstrativa:** telas de login, cadastro e recuperação de senha.
- **Página inicial e navegação:** acesso às áreas principais do aplicativo.
- **Cardápio:** listagem de produtos, busca, filtros por categoria e filtros por restrições alimentares.
- **Detalhes dos produtos:** apresentação de descrição, ingredientes, informações nutricionais e avisos relacionados a alergênicos, conforme os dados cadastrados.
- **Restrições alimentares:** opções para Sem APLV, Sem Soja, Sem Oleaginosas, Sem Açúcar Adicionado, Sem Sal Adicionado, Low FODMAP, Low Carb, Sem Aditivos Artificiais, Vegano, Vegetariano, Sem lactose e Sem glúten.
- **Favoritos e carrinho:** adicionar e consultar produtos selecionados.
- **Finalização simulada do pedido:** escolha entre retirada e delivery, seleção de forma de pagamento e confirmação.
- **Pedidos:** consulta de pedidos e visualização de status demonstrativos.
- **Perfil:** edição de informações, gerenciamento de endereços, preferências de restrições alimentares, notificações e configurações.
- **Ofertas:** visualização de ofertas, combos e vales-presente.
- **Área administrativa demonstrativa:** painel, gerenciamento de produtos e atualização do status dos pedidos.
- **Páginas institucionais:** telas “Conheça” e “Contato”.

A filtragem por múltiplas restrições utiliza a lógica definida na implementação do aplicativo. As informações alimentares e nutricionais são dados de demonstração e não substituem a confirmação dos ingredientes, dos alergênicos ou dos procedimentos de prevenção de contaminação cruzada com o estabelecimento responsável.

## Estrutura do projeto

```text
lib/
├── main.dart
├── data/
│   └── mock_data.dart
├── models/
│   └── models.dart
├── state/
│   └── app_state.dart
├── theme/
│   └── app_theme.dart
├── widgets/
│   ├── dvanille_brand.dart
│   └── product_widgets.dart
└── screens/
    ├── admin/
    ├── auth/
    ├── cart/
    ├── checkout/
    ├── conheca/
    ├── contato/
    ├── favorites/
    ├── home/
    ├── menu/
    ├── offers/
    ├── orders/
    └── profile/

assets/
├── 1.png
├── carrinho.png
├── fachada.png
├── lacinho.png
├── logo.3.png
└── fonts/
    └── Cream Cake.otf
```

### Organização do código

- `main.dart`: inicialização e configuração principal do aplicativo.
- `models/`: modelos e tipos de dados, incluindo produtos, pedidos, usuários, endereços e restrições alimentares.
- `data/mock_data.dart`: catálogo e dados de exemplo.
- `state/app_state.dart`: estado compartilhado e operações do protótipo.
- `theme/`: tema e identidade visual.
- `widgets/`: componentes reutilizáveis.
- `screens/`: telas agrupadas por funcionalidade.
- `assets/`: logotipos, ilustrações e fonte utilizadas na interface.

## Identidade visual

A interface utiliza a paleta visual definida para a D’Vanille:

| Cor | Código | Uso previsto |
|---|---|---|
| Marrom | `#9C8A73` | Textos, ícones e detalhes |
| Marrom escuro | `#7D6D57` | Contraste e destaques |
| Rosa pastel | `#EFCECC` | Botões e realces |
| Creme | `#FFF4E8` | Fundo predominante |
| Bege | `#E1CDB3` | Elementos secundários |

O projeto também utiliza elementos gráficos da marca, como o logotipo, o lacinho decorativo e imagens ilustrativas.

## Limitações conhecidas

Este projeto é um **protótipo local para demonstração acadêmica**:

- Os dados são mantidos em memória durante a execução e podem ser perdidos ao reiniciar o aplicativo.
- Não há back-end ou banco de dados remoto integrado.
- O login e o acesso administrativo não oferecem autenticação segura.
- Pagamentos, confirmação de compra e rastreamento de pedidos são simulações; nenhuma transação financeira real é realizada.
- Não há integração efetiva com serviços externos, como ViaCEP.
- O catálogo e os dados nutricionais são demonstrativos e podem diferir do cardápio planejado para a versão final do projeto.
- Recursos planejados para etapas futuras, como IoT e recomendações por inteligência artificial, não devem ser considerados implementados neste protótipo.

## Objetivo acadêmico

O aplicativo demonstra a proposta de uma plataforma digital para a D’Vanille, reunindo navegação pelo cardápio, apresentação de informações dos produtos e simulação de uma jornada de compra. A implementação poderá evoluir posteriormente com persistência de dados, serviços de back-end, autenticação e integrações reais.

---

**Projeto:** D’Vanille  
**Tipo:** Protótipo de aplicativo de cafeteria / e-commerce  
**Tecnologias principais:** Flutter e Dart
