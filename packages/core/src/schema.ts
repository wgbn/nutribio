// Gemini structured-output JSON schema for the weekly plan (English
// descriptions; the model writes the content in the required output language).

import type {ShoppingCategory} from './types';
import {SLOT_ORDER, WEEK_ORDER} from './plan';

export const SHOPPING_CATEGORIES: ShoppingCategory[] = [
  'produce',
  'meat_fish',
  'dairy_eggs',
  'bakery_grains',
  'pantry',
  'frozen',
  'drinks',
  'other',
];

const SHOPPING_ITEM_SCHEMA = {
  type: 'object',
  properties: {
    key: {
      type: 'string',
      description:
        'Stable lowercase slug identifying this purchasable product, e.g. "chicken_breast", "brown_rice", "olive_oil". Reuse the SAME key whenever the same product appears',
    },
    name: {
      type: 'string',
      description:
        'Product name a shopper would find in the country\'s supermarkets, in the required output language, e.g. "Peito de frango"',
    },
    category: {
      type: 'string',
      enum: [...SHOPPING_CATEGORIES],
      description:
        'Supermarket section: produce, meat_fish, dairy_eggs, bakery_grains, pantry, frozen, drinks or other',
    },
    unitWeightGrams: {
      type: 'number',
      description:
        'Typical weight of one practical unit if applicable, e.g. 60 for an egg, 120 for a potato (omit if not applicable)',
    },
    packageGrams: {
      type: 'number',
      description:
        'Typical package weight if the product is usually sold in packages, e.g. 500 for chicken breast (omit for loose produce)',
    },
    packageLabel: {
      type: 'string',
      description: 'Short package description in the required output language, e.g. "pack of 2" (omit if not useful)',
    },
  },
  required: ['key', 'name', 'category'],
};

const DISH_SCHEMA = {
  type: 'object',
  properties: {
    name: {type: 'string', description: 'Short, appealing dish name, in the required output language'},
    description: {type: 'string', description: 'Brief preparation description, in the required output language'},
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
            description:
              'Ingredient name, in the required output language, typical of the user country (e.g. "grilled chicken breast")',
          },
          amountGrams: {type: 'number', description: 'Precise quantity in grams'},
          shoppingKey: {
            type: 'string',
            description:
              'Key of the matching entry in the top-level shoppingItems catalog — the same key for the same product',
          },
          rawGrams: {
            type: 'number',
            description:
              'Raw/purchase-weight equivalent of amountGrams when the recipe weight is cooked (e.g. 150 g cooked rice ~ 50 g raw); equal to amountGrams when the weight is already raw',
          },
          unit: {
            type: 'string',
            description: 'Additional practical unit if helpful, e.g. "1 unit", "1 tbsp"',
          },
        },
        required: ['item', 'amountGrams'],
      },
    },
    macros: {
      type: 'object',
      description: 'Approximate macros for the whole portion',
      properties: {
        kcal: {type: 'number'},
        protein: {type: 'number', description: 'grams'},
        carbs: {type: 'number', description: 'grams'},
        fat: {type: 'number', description: 'grams'},
      },
      required: ['kcal', 'protein', 'carbs', 'fat'],
    },
    notes: {type: 'string', description: 'Preparation or substitution tip, in the required output language'},
  },
  required: ['name', 'ingredients'],
};

const MEAL_SCHEMA = {
  type: 'object',
  properties: {
    slot: {type: 'string', enum: [...SLOT_ORDER]},
    variations: {
      type: 'array',
      description: 'Exactly 3 dish variations for this meal',
      items: DISH_SCHEMA,
      minItems: 3,
      maxItems: 3,
    },
  },
  required: ['slot', 'variations'],
};

const DAY_SCHEMA = {
  type: 'object',
  properties: {
    day: {type: 'string', enum: [...WEEK_ORDER]},
    meals: {type: 'array', items: MEAL_SCHEMA},
  },
  required: ['day', 'meals'],
};

export const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    overview: {type: 'string', description: '2-3 sentence summary of the weekly plan, in the required output language'},
    week: {type: 'array', items: DAY_SCHEMA},
    shoppingItems: {
      type: 'array',
      description:
        'Canonical shopping catalog for the whole week: ONE entry per purchasable product, referenced by the ingredients\' shoppingKey fields. Include every product used across all dishes and variations',
      items: SHOPPING_ITEM_SCHEMA,
    },
  },
  required: ['week', 'shoppingItems'],
};
