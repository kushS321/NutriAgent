import { Allergen } from '@/types/nutrition';

export interface AllergenPattern {
  name: string;
  keywords: string[];
  derivedIngredients: string[];
  falsePositives?: string[]; // e.g. "cocoa butter", "shea butter", "butternut squash"
}

export const ALLERGEN_DEFINITIONS: Record<Allergen, AllergenPattern> = {
  peanuts: {
    name: 'Peanuts',
    keywords: ['peanut', 'peanuts', 'groundnut', 'groundnuts', 'arachis', 'monkey nut', 'goober'],
    derivedIngredients: ['peanut butter', 'peanut flour', 'peanut oil', 'arachis oil'],
    falsePositives: ['peanut-free'],
  },
  tree_nuts: {
    name: 'Tree Nuts',
    keywords: [
      'almond', 'almonds', 'cashew', 'cashews', 'walnut', 'walnuts',
      'pecan', 'pecans', 'hazelnut', 'hazelnuts', 'filbert', 'filberts',
      'pistachio', 'pistachios', 'macadamia', 'brazil nut', 'brazil nuts',
      'chestnut', 'chestnuts', 'pine nut', 'pine nuts', 'pignoli'
    ],
    derivedIngredients: [
      'almond milk', 'almond flour', 'cashew butter', 'walnut oil',
      'praline', 'marzipan', 'nutmeal', 'tree nut', 'tree nuts'
    ],
    falsePositives: ['nutmeg', 'butternut squash'],
  },
  milk: {
    name: 'Milk / Dairy',
    keywords: [
      'milk', 'dairy', 'butter', 'cream', 'cheese', 'yogurt', 'curd',
      'whey', 'casein', 'caseinate', 'lactalbumin', 'lactoglobulin',
      'lactose', 'ghee', 'buttermilk', 'sour cream', 'custard', 'paneer',
      'khoa', 'mawa', 'chenna'
    ],
    derivedIngredients: [
      'whey protein', 'milk solids', 'nonfat milk', 'skim milk',
      'milk powder', 'milkfat', 'sodium caseinate', 'calcium caseinate', 'demineralized whey'
    ],
    falsePositives: ['cocoa butter', 'cacao butter', 'shea butter', 'butternut squash', 'dairy-free'],
  },
  eggs: {
    name: 'Eggs',
    keywords: [
      'egg', 'eggs', 'egg yolk', 'egg white', 'albumin', 'albumen',
      'ovalbumin', 'ovomucin', 'ovomucoid', 'vitellin', 'lysozyme',
      'mayonnaise', 'meringue'
    ],
    derivedIngredients: ['dried egg', 'egg powder', 'egg solids', 'globulin'],
    falsePositives: ['egg-free'],
  },
  fish: {
    name: 'Fish',
    keywords: [
      'fish', 'salmon', 'tuna', 'cod', 'haddock', 'halibut', 'mackerel',
      'trout', 'anchovy', 'anchovies', 'sardine', 'tilapia', 'bass',
      'caviar', 'surimi', 'isinglass', 'worcestershire'
    ],
    derivedIngredients: ['fish sauce', 'fish gelatin', 'fish oil'],
    falsePositives: ['starfish', 'silverfish'],
  },
  shellfish: {
    name: 'Crustaceans & Shellfish',
    keywords: [
      'shrimp', 'crab', 'lobster', 'prawn', 'prawns', 'crawfish', 'crayfish',
      'clam', 'clams', 'mussel', 'mussels', 'oyster', 'oysters', 'scallop',
      'scallops', 'squid', 'calamari', 'octopus', 'cuttlefish', 'krill'
    ],
    derivedIngredients: ['glucosamine', 'crab extract', 'clam broth'],
  },
  wheat: {
    name: 'Wheat',
    keywords: [
      'wheat', 'spelt', 'durum', 'semolina', 'kamut', 'farina',
      'graham', 'bulgur', 'couscous', 'einkorn', 'emmer', 'atta', 'maida', 'suji', 'rava'
    ],
    derivedIngredients: [
      'wheat flour', 'wheat gluten', 'wheat starch', 'wheat germ',
      'wheat bran', 'hydrolyzed wheat protein', 'modified wheat starch', 'refined wheat flour'
    ],
    falsePositives: ['wheat-free', 'buckwheat'], // Buckwheat is gluten-free pseudo-cereal
  },
  soy: {
    name: 'Soy',
    keywords: [
      'soy', 'soya', 'soybean', 'soybeans', 'edamame', 'tofu', 'tempeh',
      'miso', 'natto', 'tamari', 'shoyu'
    ],
    derivedIngredients: [
      'soy lecithin', 'soy protein', 'soy flour', 'soy oil',
      'hydrolyzed soy protein', 'textured vegetable protein', 'tvp', 'ins 322'
    ],
    falsePositives: ['soy-free'],
  },
  sesame: {
    name: 'Sesame',
    keywords: ['sesame', 'sesamum', 'tahini', 'tahina', 'benne', 'sesamol', 'til'],
    derivedIngredients: ['sesame oil', 'sesame seed', 'sesame paste', 'halva'],
    falsePositives: ['sesame-free'],
  },
  sulfites: {
    name: 'Sulfites',
    keywords: [
      'sulfite', 'sulfites', 'sulphite', 'sulphites',
      'sulfur dioxide', 'sodium sulfite', 'sodium bisulfite',
      'potassium bisulfite', 'sodium metabisulfite', 'potassium metabisulfite',
      'ins 220', 'ins 221', 'ins 222', 'ins 223', 'ins 224'
    ],
    derivedIngredients: ['e220', 'e221', 'e222', 'e223', 'e224', 'e226', 'e227', 'e228'],
  },
  mustard: {
    name: 'Mustard',
    keywords: ['mustard', 'sinapis', 'brassica', 'sarson', 'rai'],
    derivedIngredients: ['mustard seed', 'mustard powder', 'mustard flour', 'mustard oil'],
  },
  celery: {
    name: 'Celery',
    keywords: ['celery', 'celeriac', 'celery seed', 'celery stalk'],
    derivedIngredients: ['celery powder', 'celery extract', 'celery salt'],
  },
};

export const ANIMAL_DERIVED_INGREDIENTS = [
  'meat', 'beef', 'pork', 'poultry', 'chicken', 'turkey', 'lamb', 'mutton', 'bacon', 'ham',
  'gelatin', 'collagen', 'carmine', 'cochineal', 'e120', 'ins 120', 'tallow', 'lard',
  'animal rennet', 'rennet', 'pepsin', 'isinglass', 'bone char', 'castoreum', 'shellac',
  'confectioner\'s glaze', 'anchovy', 'fish sauce', 'suet', 'animal fat'
];

export const GLUTEN_CONTAINING_GRAINS = [
  'wheat', 'barley', 'rye', 'malt', 'brewer\'s yeast', 'triticale',
  'spelt', 'durum', 'semolina', 'kamut', 'farina', 'graham', 'bulgur', 'maida', 'atta', 'suji'
];

export const JAIN_RESTRICTED_INGREDIENTS = [
  'onion', 'garlic', 'potato', 'potatoes', 'carrot', 'carrots', 'radish', 'beetroot',
  'ginger', 'turmeric root', 'shallots', 'leek', 'scallion', 'tuber'
];

// Common Food Additives (INS / E-numbers) Decoded
export interface AdditiveInfo {
  code: string;
  name: string;
  purpose: string;
  origin: 'plant' | 'mineral' | 'synthetic' | 'animal' | 'variable';
  note: string;
}

export const COMMON_FOOD_ADDITIVES: Record<string, AdditiveInfo> = {
  'ins 621': {
    code: 'INS 621',
    name: 'Monosodium Glutamate (MSG)',
    purpose: 'Flavor enhancer (Umami)',
    origin: 'synthetic',
    note: 'Generally recognized as safe by FSSAI & FDA. Some individuals report subjective sensitivity.',
  },
  'ins 500': {
    code: 'INS 500',
    name: 'Sodium Carbonates (Baking Soda)',
    purpose: 'Acidity regulator & raising agent',
    origin: 'mineral',
    note: 'Safe and standard leavening agent used in baked products.',
  },
  'ins 322': {
    code: 'INS 322',
    name: 'Lecithins (Soy / Sunflower)',
    purpose: 'Emulsifier',
    origin: 'plant',
    note: 'Helps blend oils and water. If derived from soy, requires allergen declaration under FSSAI.',
  },
  'ins 330': {
    code: 'INS 330',
    name: 'Citric Acid',
    purpose: 'Acidity regulator & natural antioxidant',
    origin: 'plant',
    note: 'Naturally occurring in citrus fruits; produced by fermentation of carbohydrates.',
  },
  'ins 120': {
    code: 'INS 120',
    name: 'Carmine / Cochineal Extract',
    purpose: 'Natural red colorant',
    origin: 'animal',
    note: 'Derived from insects. Non-vegetarian under FSSAI; requires declaration.',
  },
  'ins 150d': {
    code: 'INS 150d',
    name: 'Sulphite Ammonia Caramel',
    purpose: 'Coloring agent (Brown)',
    origin: 'synthetic',
    note: 'Commonly found in colas, sauces, and confectionery.',
  },
  'ins 211': {
    code: 'INS 211',
    name: 'Sodium Benzoate',
    purpose: 'Preservative (Antimicrobial)',
    origin: 'synthetic',
    note: 'Inhibits yeast and mold growth in acidic foods, jams, and soft drinks within FSSAI permitted limits.',
  },
  'ins 635': {
    code: 'INS 635',
    name: 'Disodium 5\'-ribonucleotides',
    purpose: 'Synergistic flavor enhancer',
    origin: 'variable',
    note: 'Frequently paired with MSG in instant noodles and savory seasonings.',
  },
};
