export const translateCategory = (categorySlugOrName: string, t: (key: string) => string): string => {
  if (!categorySlugOrName) return '';
  const slug = categorySlugOrName
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const map: Record<string, string> = {
    // Portuguese slugs/names mapped to locale keys
    'entradas': 'categories.appetizer',
    'entrada': 'categories.appetizer',
    'aperitivo': 'categories.appetizer',

    'lanches': 'categories.snack',
    'lanche': 'categories.snack',
    'snacks': 'categories.snack',

    'saladas': 'categories.salad',
    'salada': 'categories.salad',

    'sobremesas': 'categories.dessert',
    'sobremesa': 'categories.dessert',
    'doces': 'categories.dessert',

    'sopas': 'categories.soup',
    'sopa': 'categories.soup',

    'bebidas': 'categories.beverage',
    'bebida': 'categories.beverage',

    'pratos-principais': 'categories.mainCourse',
    'prato-principal': 'categories.mainCourse',

    'cafe-da-manha': 'categories.breakfast',
    'cafe-da-manha-': 'categories.breakfast',
    'cafe': 'categories.breakfast',
    'breakfast': 'categories.breakfast',

    'almoco': 'categories.lunch',
    'almoço': 'categories.lunch',

    'jantar': 'categories.dinner',
  };

  const key = map[slug];
  return key ? t(key) : categorySlugOrName; // fallback to original if not a known main category
};
