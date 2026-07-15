export interface MenuItem {
  id: string;
  name: string;
  category: "breads" | "pastries" | "cakes" | "cookies" | "drinks";
  description: string;
  price: number;
  image: string;
  tags: string[];
  available: boolean;
  ratings: number[];
}

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Sourdough Loaf",
    category: "breads",
    description:
      "Slow-fermented for 24 hours, our signature sourdough has a crisp crust and chewy crumb with a delicate tang.",
    price: 8.5,
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80",
    tags: ["signature", "vegan"],
    available: true,
    ratings: [5, 5, 4, 5, 4],
  },
  {
    id: "2",
    name: "Cinnamon Roll",
    category: "pastries",
    description:
      "Soft, pillowy rolls swirled with cinnamon-sugar filling and topped with our housemade cream cheese glaze.",
    price: 4.5,
    image: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&q=80",
    tags: ["bestseller"],
    available: true,
    ratings: [5, 5, 5, 4, 5],
  },
  {
    id: "3",
    name: "Chocolate Layer Cake",
    category: "cakes",
    description:
      "Three layers of moist chocolate sponge sandwiched with silky ganache and finished with dark chocolate frosting.",
    price: 38.0,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80",
    tags: ["celebration", "bestseller"],
    available: true,
    ratings: [5, 4, 5, 5],
  },
  {
    id: "4",
    name: "Almond Croissant",
    category: "pastries",
    description:
      "Classic French croissant filled with rich almond cream and topped with toasted flaked almonds.",
    price: 5.0,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    tags: ["french", "signature"],
    available: true,
    ratings: [4, 5, 4, 3, 5],
  },
  {
    id: "5",
    name: "Whole Wheat Honey Loaf",
    category: "breads",
    description:
      "A wholesome loaf made with stoneground whole wheat flour, local honey, and a touch of olive oil.",
    price: 7.5,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    tags: ["healthy", "vegan"],
    available: true,
    ratings: [4, 4, 5, 4],
  },
  {
    id: "6",
    name: "Strawberry Cheesecake",
    category: "cakes",
    description:
      "Creamy New York-style cheesecake on a buttery graham cracker base with fresh strawberry compote.",
    price: 42.0,
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80",
    tags: ["celebration"],
    available: true,
    ratings: [5, 5, 5],
  },
  {
    id: "7",
    name: "Double Chocolate Cookies",
    category: "cookies",
    description:
      "Thick, fudgy cookies loaded with two kinds of chocolate chips, slightly crisp on the edges and soft in the center.",
    price: 3.0,
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
    tags: ["bestseller"],
    available: true,
    ratings: [5, 5, 4, 5, 5],
  },
  {
    id: "8",
    name: "Pistachio Financier",
    category: "pastries",
    description:
      "Elegant French almond cakes with a pistachio crème filling and delicate golden crust.",
    price: 3.5,
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5994?w=600&q=80",
    tags: ["french"],
    available: true,
    ratings: [4, 4, 5],
  },
  {
    id: "9",
    name: "Artisan Baguette",
    category: "breads",
    description:
      "Traditional French baguette with a golden, crackling crust and an open, airy crumb. Best enjoyed fresh.",
    price: 4.0,
    image: "https://images.unsplash.com/photo-1568471173242-461f0a730452?w=600&q=80",
    tags: ["french", "vegan"],
    available: true,
    ratings: [5, 4, 4, 5],
  },
  {
    id: "10",
    name: "Cardamom Rose Cake",
    category: "cakes",
    description:
      "Our signature Middle-Eastern inspired cake with cardamom sponge, rosewater buttercream, and crushed pistachios.",
    price: 45.0,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    tags: ["signature", "celebration"],
    available: true,
    ratings: [5, 5, 5, 4, 5],
  },
  {
    id: "11",
    name: "Shortbread Rounds",
    category: "cookies",
    description:
      "Classic buttery shortbread with a melt-in-your-mouth texture, lightly dusted with powdered sugar.",
    price: 2.5,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&q=80",
    tags: ["vegan-option"],
    available: true,
    ratings: [4, 4, 3, 5],
  },
  {
    id: "12",
    name: "Hot Chocolate",
    category: "drinks",
    description:
      "Rich, velvety hot chocolate made with 72% dark Belgian chocolate and steamed whole milk.",
    price: 5.5,
    image: "https://images.unsplash.com/photo-1517578239113-b03992dcdd25?w=600&q=80",
    tags: ["hot"],
    available: true,
    ratings: [5, 5, 4],
  },
];
