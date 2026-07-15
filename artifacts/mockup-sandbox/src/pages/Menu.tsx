import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { fetchMenu, type MenuItem } from "../lib/api";
import MenuCard from "../components/MenuCard";
import type { CartItem } from "../types";

interface MenuPageProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
}

const categories = [
  { id: "all", label: "All Items" },
  { id: "breads", label: "Breads" },
  { id: "pastries", label: "Pastries" },
  { id: "cakes", label: "Cakes" },
  { id: "cookies", label: "Cookies" },
  { id: "drinks", label: "Drinks" },
];

const sortOptions = [
  { id: "default", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

export default function MenuPage({ cart, onAddToCart }: MenuPageProps) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchMenu()
      .then((data) => {
        setItems(data.items);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load menu. Please try again.");
        setLoading(false);
      });
  }, [retryCount]);

  const cartIds = new Set(cart.map((c) => c.id));

  const filtered = items
    .filter((item) => {
      const matchesCat = category === "all" || item.category === category;
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating")
        return (b.averageRating ?? 0) - (a.averageRating ?? 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* Hero */}
      <div className="bg-[#2C1810] pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[#D4A017] text-sm font-semibold tracking-widest uppercase">
          Fresh Daily
        </span>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-2 mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Our Menu
        </h1>
        <p className="text-white/60 max-w-lg mx-auto text-sm sm:text-base">
          Browse our full selection of handcrafted baked goods. All items are
          made fresh daily — order before 2pm for same-day pickup.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search + Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1810]/40"
            />
            <input
              type="text"
              placeholder="Search breads, pastries, cakes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#D4A017]/20 bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 text-[#2C1810] text-sm placeholder:text-[#2C1810]/40"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#2C1810]/40 hover:text-[#2C1810]"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#D4A017]/20 bg-white text-[#2C1810] text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 cursor-pointer"
            >
              {sortOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`sm:hidden flex items-center gap-1.5 px-4 py-3 rounded-xl border text-sm font-medium transition-colors ${
                showFilters
                  ? "bg-[#D4A017] text-[#2C1810] border-[#D4A017]"
                  : "border-[#D4A017]/20 bg-white text-[#2C1810]"
              }`}
            >
              <SlidersHorizontal size={15} /> Filter
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div
          className={`gap-2 flex-wrap mb-8 ${
            showFilters ? "flex" : "hidden sm:flex"
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                category === cat.id
                  ? "bg-[#2C1810] text-[#F5E6C8]"
                  : "bg-white text-[#2C1810]/70 border border-[#D4A017]/20 hover:border-[#D4A017]/60 hover:text-[#2C1810]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && !error && (
          <p className="text-sm text-[#2C1810]/50 mb-6">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""} found
            {category !== "all" && ` in ${categories.find((c) => c.id === category)?.label}`}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="bg-[#2C1810] text-white px-6 py-2.5 rounded-xl text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-5xl mb-4">🥐</p>
                <p className="text-[#2C1810]/60 font-medium">No items found</p>
                <p className="text-sm text-[#2C1810]/40 mt-1">Try a different search or category</p>
                <button
                  onClick={() => { setSearch(""); setCategory("all"); }}
                  className="mt-4 text-[#D4A017] text-sm font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filtered.map((item) => (
                  <MenuCard
                    key={item.id}
                    item={item}
                    onAddToCart={onAddToCart}
                    inCart={cartIds.has(item.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
