/**
 * Dados puros do seed (sem acesso ao banco) - também validados por tests/unit/seedData.test.js.
 */
const { slugify } = require('../src/utils/slug');

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

const CATEGORIES = [
  { name: 'Cafés', description: 'Espressos, cappuccinos e cafés especiais.' },
  { name: 'Doces', description: 'Brigadeiros, brownies, cookies e outras delícias.' },
  { name: 'Bolos', description: 'Bolos caseiros em fatia, feitos todos os dias.' },
  { name: 'Milkshakes', description: 'Milkshakes cremosos para refrescar.' },
  { name: 'Bebidas', description: 'Sucos, chás e bebidas geladas.' },
  { name: 'Salgados', description: 'Salgados assados e folhados.' },
  { name: 'Combos', description: 'Combinações com preço especial.' },
  { name: 'Ofertas', description: 'Promoções da semana.' },
];

// Atalho para os valores nutricionais: [kcal, carboidratos g, proteínas g, gorduras g, fibras g, sódio mg]
const nutrition = ([calories, carbohydrates, proteins, fats, fiber, sodium]) => ({
  calories,
  carbohydrates,
  proteins,
  fats,
  fiber,
  sodium,
});

/**
 * flags: g=glúten, l=lactose, m=leite, e=ovos, s=soja, p=amendoim, n=castanhas, a=açúcar, v=vegetariano, V=vegano
 * Regras do backend: vegano => vegetariano e sem leite/lactose/ovos; lactose => leite.
 */
const FLAGS = {
  g: 'containsGluten',
  l: 'containsLactose',
  m: 'containsMilk',
  e: 'containsEggs',
  s: 'containsSoy',
  p: 'containsPeanuts',
  n: 'containsNuts',
  a: 'containsSugar',
  v: 'isVegetarian',
  V: 'isVegan',
};

const ALLERGEN_LABELS = {
  containsGluten: 'glúten',
  containsLactose: 'lactose',
  containsMilk: 'leite',
  containsEggs: 'ovos',
  containsSoy: 'soja',
  containsPeanuts: 'amendoim',
  containsNuts: 'castanhas',
};

// [categoria, nome, preço, preço promocional, flags, nutrição, ingredientes, extras]
const PRODUCTS = [
  // Cafés
  ['Cafés', 'Espresso', 6.5, null, 'vV', [2, 0.3, 0.1, 0, 0, 5], 'Café arábica moído na hora, água.', { sku: 'CAF-001', stock: 120, isFeatured: true, preparationTime: 2, description: 'Café curto e intenso, extraído na hora.' }],
  ['Cafés', 'Cappuccino Cremoso', 14.9, 12.9, 'lmv', [120, 11, 6, 6, 0, 80], 'Espresso, leite vaporizado, espuma de leite e canela.', { sku: 'CAF-002', stock: 80, isFeatured: true, preparationTime: 6, description: 'Espresso com leite vaporizado e espuma cremosa.' }],
  ['Cafés', 'Café Coado', 6.0, null, 'vV', [3, 0.5, 0.2, 0, 0, 6], 'Café torrado e moído, água.', { sku: 'CAF-003', stock: 100, preparationTime: 3, description: 'Coado no filtro de pano, bem tradicional.' }],
  ['Cafés', 'Latte de Baunilha', 16.5, null, 'lmav', [190, 24, 7, 7, 0, 95], 'Espresso, leite, calda de baunilha.', { sku: 'CAF-004', stock: 60, isFeatured: true, preparationTime: 6, description: 'Suave, com calda artesanal de baunilha.' }],
  ['Cafés', 'Mocha de Chocolate', 17.9, null, 'lmav', [260, 33, 8, 10, 1, 110], 'Espresso, leite, calda de chocolate, chantilly.', { sku: 'CAF-005', stock: 50, preparationTime: 7, description: 'Café com chocolate belga e chantilly.' }],
  ['Cafés', 'Cappuccino Vegetal', 15.9, null, 'sVv', [105, 9, 5, 5, 1, 70], 'Espresso, bebida de soja vaporizada, canela.', { sku: 'CAF-006', stock: 45, preparationTime: 6, description: 'Versão vegana feita com bebida de soja.' }],

  // Doces
  ['Doces', 'Brigadeiro Gourmet', 4.5, null, 'lmav', [95, 13, 1.5, 4.5, 0.5, 25], 'Leite condensado, chocolate 50%, manteiga, granulado belga.', { sku: 'DOC-001', stock: 200, isFeatured: true, preparationTime: 1, description: 'Brigadeiro de chocolate belga enrolado na hora.' }],
  ['Doces', 'Brownie Vegano', 11.5, null, 'gaVv', [310, 42, 4, 14, 3, 120], 'Farinha de trigo, cacau 70%, açúcar mascavo, óleo de coco.', { sku: 'DOC-002', stock: 30, isFeatured: true, preparationTime: 2, description: 'Brownie de cacau 70% sem leite e sem ovos.' }],
  ['Doces', 'Cookie de Chocolate', 7.9, null, 'glmeav', [240, 31, 3, 12, 1.5, 140], 'Farinha de trigo, manteiga, ovos, gotas de chocolate, açúcar.', { sku: 'DOC-003', stock: 70, preparationTime: 1, description: 'Crocante por fora e macio por dentro.' }],
  ['Doces', 'Macaron de Amêndoas', 6.5, null, 'enav', [85, 11, 2, 4, 0.5, 15], 'Farinha de amêndoas, claras, açúcar, recheio de ganache.', { sku: 'DOC-004', stock: 90, isFeatured: true, preparationTime: 1, description: 'Sem glúten, com recheio de ganache.' }],
  ['Doces', 'Torta de Limão', 12.0, null, 'glmeav', [380, 46, 5, 19, 1, 210], 'Biscoito, leite condensado, limão, creme de leite, merengue.', { sku: 'DOC-005', stock: 0, isAvailable: false, preparationTime: 1, description: 'Esgotada no momento (exemplo de produto indisponível).' }],
  ['Doces', 'Cheesecake de Frutas Vermelhas', 15.9, 13.9, 'glmeav', [420, 38, 7, 27, 1, 260], 'Cream cheese, biscoito, ovos, geleia de frutas vermelhas.', { sku: 'DOC-006', stock: 25, preparationTime: 1, description: 'Cremoso, com calda de frutas vermelhas.' }],
  ['Doces', 'Palha Italiana', 5.5, null, 'glmasv', [150, 20, 2, 7, 0.5, 60], 'Chocolate, leite condensado, biscoito maisena, amendoim.', { sku: 'DOC-007', stock: 4, preparationTime: 1, description: 'Estoque baixo: ótimo para testar o painel de estoque.' }],

  // Bolos
  ['Bolos', 'Bolo de Cenoura com Cobertura', 9.9, null, 'glmeav', [330, 45, 4, 15, 1.5, 180], 'Cenoura, ovos, óleo, farinha, açúcar, cobertura de chocolate.', { sku: 'BOL-001', stock: 40, isFeatured: true, preparationTime: 1, description: 'Fatia generosa com cobertura de chocolate.' }],
  ['Bolos', 'Bolo de Chocolate sem Glúten', 10.5, null, 'lmeav', [350, 44, 5, 17, 2, 160], 'Farinha de arroz, cacau, ovos, manteiga, açúcar.', { sku: 'BOL-002', stock: 30, preparationTime: 1, description: 'Feito com farinha de arroz, sem glúten.' }],
  ['Bolos', 'Bolo Vegano de Banana', 9.5, null, 'gaVv', [280, 46, 3, 9, 3, 90], 'Banana, farinha integral, açúcar mascavo, óleo de coco, canela.', { sku: 'BOL-003', stock: 25, preparationTime: 1, description: 'Úmido, com banana e canela, 100% vegetal.' }],
  ['Bolos', 'Bolo Red Velvet', 14.5, null, 'glmeav', [410, 52, 5, 21, 1, 230], 'Farinha, cacau, ovos, manteiga, cream cheese.', { sku: 'BOL-004', stock: 20, isFeatured: true, preparationTime: 1, description: 'Camadas macias com recheio de cream cheese.' }],

  // Milkshakes
  ['Milkshakes', 'Milkshake de Morango', 18.9, null, 'lmav', [380, 55, 8, 14, 1, 150], 'Sorvete de creme, leite, calda de morango, chantilly.', { sku: 'MIL-001', stock: 60, preparationTime: 5, description: 'Cremoso, com pedaços de morango.' }],
  ['Milkshakes', 'Milkshake de Chocolate', 19.9, 16.9, 'lmav', [450, 62, 9, 18, 2, 170], 'Sorvete de chocolate, leite, calda e chantilly.', { sku: 'MIL-002', stock: 55, isFeatured: true, preparationTime: 5, description: 'O clássico, bem chocolatudo.' }],
  ['Milkshakes', 'Milkshake Vegano de Coco', 19.5, null, 'aVv', [360, 48, 3, 17, 2, 80], 'Sorvete vegano de coco, leite de coco, açúcar.', { sku: 'MIL-003', stock: 35, preparationTime: 5, description: 'Sem leite, com sorvete vegano de coco.' }],

  // Bebidas
  ['Bebidas', 'Suco de Laranja Natural', 8.5, null, 'vV', [90, 21, 1.5, 0.3, 1, 2], 'Laranja espremida na hora.', { sku: 'BEB-001', stock: 80, preparationTime: 3, description: '300 ml, sem açúcar adicionado.' }],
  ['Bebidas', 'Água com Gás', 4.0, null, 'vV', [0, 0, 0, 0, 0, 3], 'Água mineral gaseificada.', { sku: 'BEB-002', stock: 150, preparationTime: 1, description: '500 ml.' }],
  ['Bebidas', 'Chá Gelado de Hibisco', 7.5, null, 'avV', [60, 15, 0, 0, 0, 5], 'Hibisco, água, açúcar, limão.', { sku: 'BEB-003', stock: 70, preparationTime: 2, description: 'Refrescante e levemente adocicado.' }],
  ['Bebidas', 'Limonada Siciliana', 9.0, null, 'avV', [85, 21, 0.3, 0, 0.5, 4], 'Limão siciliano, água, açúcar, hortelã.', { sku: 'BEB-004', stock: 65, preparationTime: 3, description: 'Com hortelã fresca.' }],

  // Salgados
  ['Salgados', 'Pão de Queijo', 6.5, null, 'lmev', [140, 14, 4, 7, 0.3, 190], 'Polvilho, queijo minas, ovos, leite, óleo.', { sku: 'SAL-001', stock: 150, isFeatured: true, preparationTime: 2, description: 'Sem glúten, quentinho, saindo do forno.' }],
  ['Salgados', 'Coxinha de Frango', 8.5, null, 'glm', [260, 28, 11, 11, 1, 420], 'Massa de trigo, frango desfiado, requeijão.', { sku: 'SAL-002', stock: 60, preparationTime: 3, description: 'Massa leve e recheio de frango com requeijão.' }],
  ['Salgados', 'Empada de Palmito', 7.9, null, 'glmev', [230, 22, 4, 14, 2, 340], 'Farinha, manteiga, palmito, ovos.', { sku: 'SAL-003', stock: 45, preparationTime: 2, description: 'Opção vegetariana com massa amanteigada.' }],
  ['Salgados', 'Quiche Vegana de Cogumelos', 12.5, null, 'gsVv', [270, 24, 9, 15, 3, 380], 'Massa vegetal, tofu, cogumelos, ervas.', { sku: 'SAL-004', stock: 20, preparationTime: 4, description: 'Recheio de tofu e cogumelos.' }],
  ['Salgados', 'Croissant de Presunto e Queijo', 11.9, null, 'glme', [390, 34, 15, 21, 1.5, 720], 'Massa folhada, presunto, queijo, ovos.', { sku: 'SAL-005', stock: 35, preparationTime: 4, description: 'Folhado na hora, com queijo derretido.' }],

  // Combos
  ['Combos', 'Combo Café + Bolo', 19.9, 17.9, 'glmeav', [450, 55, 10, 20, 1.5, 230], 'Um café coado e uma fatia de bolo do dia.', { sku: 'COM-001', stock: 40, isFeatured: true, preparationTime: 4, description: 'Café coado + fatia de bolo do dia.' }],
  ['Combos', 'Combo Lanche da Tarde', 24.9, null, 'glmeav', [620, 70, 18, 28, 2, 780], 'Cappuccino, pão de queijo e cookie.', { sku: 'COM-002', stock: 35, preparationTime: 6, description: 'Cappuccino + pão de queijo + cookie.' }],

  // Ofertas
  ['Ofertas', 'Oferta do Dia: Espresso + Cookie', 14.9, 11.9, 'glmeav', [245, 31, 3, 12, 1.5, 145], 'Um espresso e um cookie de chocolate.', { sku: 'OFE-001', stock: 30, isFeatured: true, preparationTime: 3, description: 'Só hoje! Espresso + cookie de chocolate.' }],
];

const PROMOTIONS = [
  { name: 'Bem-vindo', description: '10% de desconto na compra mínima de R$ 20.', code: 'BEMVINDO10', type: 'PERCENTAGE', value: 10, minOrderValue: 20, usageLimit: 1000, perUserLimit: 1, startsAt: daysFromNow(-30), endsAt: daysFromNow(365) },
  { name: 'Semana do Café', description: 'R$ 5 de desconto em pedidos acima de R$ 25.', code: 'CAFE5', type: 'FIXED', value: 5, minOrderValue: 25, usageLimit: 200, perUserLimit: 3, startsAt: daysFromNow(-7), endsAt: daysFromNow(60) },
  { name: 'Doce Tarde', description: '15% em pedidos acima de R$ 40.', code: 'DOCE15', type: 'PERCENTAGE', value: 15, minOrderValue: 40, usageLimit: null, perUserLimit: 5, startsAt: daysFromNow(-1), endsAt: daysFromNow(90) },
  // Cupons para testar as regras de validação:
  { name: 'Cupom expirado', description: 'Serve para testar cupom expirado.', code: 'EXPIRADO10', type: 'PERCENTAGE', value: 10, minOrderValue: null, usageLimit: 100, perUserLimit: 1, startsAt: daysFromNow(-60), endsAt: daysFromNow(-1) },
  { name: 'Cupom futuro', description: 'Ainda não começou.', code: 'FUTURO20', type: 'PERCENTAGE', value: 20, minOrderValue: null, usageLimit: 100, perUserLimit: 1, startsAt: daysFromNow(30), endsAt: daysFromNow(60) },
  { name: 'Cupom inativo', description: 'Desativado pelo admin.', code: 'INATIVO30', type: 'PERCENTAGE', value: 30, minOrderValue: null, usageLimit: 100, perUserLimit: 1, startsAt: daysFromNow(-10), endsAt: daysFromNow(60), isActive: false },
];

const REWARDS = [
  { name: 'Espresso grátis', description: 'Um espresso por conta da casa.', pointsCost: 80 },
  { name: 'Fatia de bolo grátis', description: 'Uma fatia de bolo do dia.', pointsCost: 150 },
  { name: 'Combo Lanche da Tarde grátis', description: 'Cappuccino + pão de queijo + cookie.', pointsCost: 300 },
];


function buildProductData([categoryName, name, price, promotionalPrice, flags, nutritionValues, ingredients, extras], categoryIds) {
  const data = {
    categoryId: categoryIds[categoryName],
    name,
    slug: slugify(name),
    description: extras.description || null,
    price,
    promotionalPrice,
    sku: extras.sku,
    stock: extras.stock,
    isAvailable: extras.isAvailable !== undefined ? extras.isAvailable : true,
    isFeatured: Boolean(extras.isFeatured),
    preparationTime: extras.preparationTime || null,
    ingredients,
    ...nutrition(nutritionValues),
  };

  Object.values(FLAGS).forEach((field) => {
    data[field] = false;
  });
  [...flags].forEach((flag) => {
    data[FLAGS[flag]] = true;
  });

  const allergens = Object.entries(ALLERGEN_LABELS)
    .filter(([field]) => data[field])
    .map(([, label]) => label);
  data.allergens = allergens.length ? `Contém: ${allergens.join(', ')}.` : 'Não contém os principais alérgenos.';

  return data;
}

module.exports = { CATEGORIES, PRODUCTS, PROMOTIONS, REWARDS, FLAGS, ALLERGEN_LABELS, buildProductData };
