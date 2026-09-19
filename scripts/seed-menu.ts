import { db, menuItems } from "../lib/db/src/index.ts";

const items = [
  {
    id: "1",
    name: "Sourdough Loaf",
    category: "breads",
    description: "A rustic sourdough loaf with a crisp crust and soft, tangy center.",
    price: "6.50",
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80",
    tags: ["sourdough", "bread", "artisan"],
    available: true,
    ratings: [5, 5, 4, 5]
  },
  {
    id: "2",
    name: "Cinnamon Roll",
    category: "pastries",
    description: "Soft, buttery pastry swirled with cinnamon sugar and topped with glaze.",
    price: "4.50",
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80",
    tags: ["cinnamon", "pastry", "sweet"],
    available: true,
    ratings: [5, 4, 5]
  },
  {
    id: "3",
    name: "Chocolate Layer Cake",
    category: "cakes",
    description: "Rich chocolate cake layered with smooth chocolate frosting.",
    price: "32.00",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
    tags: ["chocolate", "cake", "dessert"],
    available: true,
    ratings: [5, 5, 5, 4]
  },
  {
    id: "4",
    name: "Almond Croissant",
    category: "pastries",
    description: "Flaky croissant filled with almond cream and topped with sliced almonds.",
    price: "5.50",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    tags: ["almond", "croissant", "pastry"],
    available: true,
    ratings: [5, 4, 5]
  },
  {
    id: "5",
    name: "Whole Wheat Honey Loaf",
    category: "breads",
    description: "Hearty whole wheat bread lightly sweetened with honey.",
    price: "7.00",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    tags: ["whole wheat", "bread", "honey"],
    available: true,
    ratings: [4, 5, 4]
  },
  {
    id: "6",
    name: "Strawberry Cheesecake",
    category: "cakes",
    description: "Creamy cheesecake topped with fresh strawberry sauce.",
    price: "34.00",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80",
    tags: ["strawberry", "cheesecake", "dessert"],
    available: true,
    ratings: [5, 5, 4, 5]
  },
  {
    id: "7",
    name: "Double Chocolate Cookies",
    category: "cookies",
    description: "Soft-baked chocolate cookies packed with chocolate chips.",
    price: "8.00",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
    tags: ["chocolate", "cookies", "sweet"],
    available: true,
    ratings: [5, 4, 5]
  },
  {
    id: "8",
    name: "Pistachio Financier",
    category: "pastries",
    description: "Delicate French almond cake with roasted pistachios.",
    price: "4.75",
    image: "https://images.unsplash.com/photo-1608196699808-7b9132c8bc7c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE0fHx8ZW58MHx8fHx8",
    tags: ["pistachio", "almond", "pastry"],
    available: true,
    ratings: [5, 5, 4]
  },
  {
    id: "9",
    name: "Artisan Baguette",
    category: "breads",
    description: "Classic French baguette with a crisp crust and airy interior.",
    price: "4.00",
    image: "https://images.unsplash.com/photo-1568471173242-461f0a730452?w=600&q=80",
    tags: ["baguette", "bread", "artisan"],
    available: true,
    ratings: [5, 4, 5]
  },
  {
    id: "10",
    name: "Cardamom Rose Cake",
    category: "cakes",
    description: "Fragrant cake infused with cardamom and delicate rose flavors.",
    price: "30.00",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    tags: ["cardamom", "rose", "cake"],
    available: true,
    ratings: [5, 4, 5]
  },
  {
    id: "11",
    name: "Shortbread Rounds",
    category: "cookies",
    description: "Classic buttery shortbread cookies with a tender crumb.",
    price: "7.00",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
    tags: ["shortbread", "cookies", "buttery"],
    available: true,
    ratings: [4, 5, 5]
  },
  {
    id: "12",
    name: "Hot Chocolate",
    category: "drinks",
    description: "Rich and creamy hot chocolate made with premium cocoa.",
    price: "5.00",
    image: "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=600&q=80",
    tags: ["chocolate", "drink", "hot"],
    available: true,
    ratings: [5, 5, 4]
  }
];

for (const item of items) {
  await db
    .insert(menuItems)
    .values(item)
    .onConflictDoUpdate({
      target: menuItems.id,
      set: {
        image: item.image,
      },
    });
}

console.log(`Seeded ${items.length} menu items.`);
process.exit(0);