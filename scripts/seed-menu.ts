import { db, menuItems } from "../lib/db/src/index.ts";

const items = [
  {
    id: "1",
    name: "Sourdough Loaf",
    category: "breads",
    description: "A rustic sourdough loaf with a crisp crust and soft, tangy center.",
    price: "6.50",
    image: "/images/sourdough-loaf.jpg",
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
    image: "/images/cinnamon-roll.jpg",
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
    image: "/images/chocolate-layer-cake.jpg",
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
    image: "/images/almond-croissant.jpg",
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
    image: "/images/whole-wheat-honey-loaf.jpg",
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
    image: "/images/strawberry-cheesecake.jpg",
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
    image: "/images/double-chocolate-cookies.jpg",
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
    image: "/images/pistachio-financier.jpg",
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
    image: "/images/artisan-baguette.jpg",
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
    image: "/images/cardamom-rose-cake.jpg",
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
    image: "/images/shortbread-rounds.jpg",
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
    image: "/images/hot-chocolate.jpg",
    tags: ["chocolate", "drink", "hot"],
    available: true,
    ratings: [5, 5, 4]
  }
];

await db.insert(menuItems).values(items).onConflictDoNothing();

console.log(`Seeded ${items.length} menu items.`);
process.exit(0);
