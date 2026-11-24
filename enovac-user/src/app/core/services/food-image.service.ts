
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FoodImageService {

private readonly imageMappings: Record<string, string[]> = {

  'masala-dosa.jpg': [
    'masala dosa', 'masala dosai', 'masala dosha',
    'masala ghee dosa'
  ],

  'plain-dosa.jpg': [
    'plain dosa', 'plain dosai', 'plain dosha',
    'ghee dosa', 'ghee dosai'
  ],

  'kal-dosai.jpg': [
    'kal dosai', 'kal dosa', 'kaldosai'
  ],

  'podi-idli.jpg': [
    'podi idli', 'podi idly', 'idli podi',
    'gunpowder idli'
  ],

  'idiyappam.jpg': [
    'idiyappam', 'idi appam', 'idiyappam with coconut',
    'string hoppers'
  ],

  'idli-vada.jpg': [
    'idli vada', 'idly vada', 'medu vada',
    'idli', 'idly', 'vada', 'vadai'
  ],

  'masala-poori.jpg': [
    'masala poori', 'masala puri'
  ],

  'poori.jpg': [
    'poori', 'puri'
  ],

  'bhel-puri.jpg': [
    'bhel puri', 'bhel'
  ],

  'french-fries.jpg': [
    'french fries', 'french fry', 'fries',
    'potato fries'
  ],

  'veg-biryani.jpg': [
    'vegetable biryani', 'veg biryani',
    'vegetable biriyani', 'veg biriyani',
    'veg brinji', 'vegetable brinji', 'brinji',
    'brinji rice'
  ],

  'mushroom-biryani.jpg': [
    'mushroom biryani', 'mushroom biriyani',
    'mushroom brinji', 'mushroom rice biryani', 'Mushroom Briyani',
  ],

  'veg-noodles.jpg': [
    'vegetable noodles', 'veg noodles',
    'veggie noodles', 'noodles', 'noodels',
    'veg noodle', 'hakka noodles'
  ],

  'chapati.jpg': [
    'chapati', 'chapathi', 'chappati',
    'chapatti', 'roti', 'phulka'
  ],

  'omelette.jpg': [
    'omelette', 'omlette', 'omelet',
    'egg omelette', 'egg omelet'
  ],

  'boiled-egg.jpg': [
    'boiled egg', 'boiled eggs',
    'egg boiled', 'egg'
  ],

  'pongal.jpg': [
    'ven pongal', 'ghee pongal',
    'pongal', 'pong'
  ],

  'veg-meals.jpg': [
    'south indian meals', 'vegetarian meals',
    'veg meals', 'full meals', 'mini meals',
    'meals'
  ],

  'lemon-rice.jpg': [
    'lemon rice', 'elumichai sadam'
  ],

  'curd-rice.jpg': [
    'curd rice', 'yogurt rice',
    'thayir sadam', 'thayir rice'
  ],

  'sambar-rice.jpg': [
    'sambar rice', 'sambhar rice',
    'sambar sadam', 'sambhar sadam'
  ],

  'buttermilk.jpg': [
    'buttermilk', 'butter milk',
    'neer mor', 'neer moru', 'moor'
  ],

  'milk.jpg': [
    'plain milk', 'milk'
  ],

  'tea.jpg': [
    'milk tea', 'masala tea',
    'tea', 'chai'
  ],

  'coffee.jpg': [
    'filter coffee', 'instant coffee',
    'black coffee', 'coffee'
  ],

  'kachori.jpg': [
    'kachori', 'kachoori'
  ],

  'samosa.jpg': [
    'samosa', 'samosas'
  ],

  'veg-puffs.jpg': [
    'vegetable puffs', 'veg puffs',
    'vegetable puff', 'veg puff', 'puffs', 'veg pupps'
  ],

  'veg-cutlet.jpg': [
    'vegetable cutlet', 'veg cutlet',
    'veg cutlets', 'cutlet'
  ],

  'veg-burger.jpg': [
    'vegetable burger', 'veg burger',
    'veggie burger', 'burger'
  ],

  'veg-pizza.jpg': [
    'vegetable pizza', 'veg pizza',
    'veggie pizza', 'pizza'
  ],

  'veg-sandwich.jpg': [
    'vegetable sandwich', 'veg sandwich',
    'veggie sandwich', 'grilled sandwich',
    'sandwich'
  ],

  'veg-pasta.jpg': [
    'vegetable pasta', 'veg pasta',
    'veggie pasta', 'penne pasta', 'pasta'
  ],

  'paneer-fried-rice.jpg': [
    'paneer fried rice', 'fried rice paneer',
    'paneer rice'
  ],
  'mushroom-briyani.jpg': [
    'mushroom biryani', 'mushroom biriyani',
    'mushroom brinji', 'mushroom rice biryani'
  ],

  'sundal.jpg': [
    'kondakadalai sundal', 'channa sundal',
    'chana sundal', 'sundal'
  ],

  'default-food.jpg': [
    'default'
  ]
};
  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

getFoodImage(foodName: string): string {

  const normalizedName = this.normalizeName(foodName || '');

  if (!normalizedName) {
    return 'assets/food-images/default-food.jpg';
  }

  const mappings = Object.entries(this.imageMappings)
    .filter(([image]) => image !== 'default-food.jpg')
    .flatMap(([image, aliases]) =>
      aliases.map(alias => ({
        image,
        alias: this.normalizeName(alias)
      }))
    )
    .sort((a, b) => b.alias.length - a.alias.length);

  for (const mapping of mappings) {

    const alias = mapping.alias;

    const matched =
      normalizedName === alias ||
      normalizedName.startsWith(alias + ' ') ||
      normalizedName.endsWith(' ' + alias) ||
      normalizedName.includes(' ' + alias + ' ');

    if (matched) {
      return `assets/food-images/${mapping.image}`;
    }
  }

  return 'assets/food-images/default-food.jpg';
}
}
