import { useState } from "react";
import { Plus, Check } from "lucide-react";
import type { MenuItem } from "../lib/api";
import { rateItem } from "../lib/api";
import StarRating from "./StarRating";

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  inCart?: boolean;
}

const categoryColors: Record<string, string> = {
  breads: "bg-amber-100 text-amber-800",
  pastries: "bg-rose-100 text-rose-700",
  cakes: "bg-purple-100 text-purple-700",
  cookies: "bg-orange-100 text-orange-700",
  drinks: "bg-sky-100 text-sky-700",
};

export default function MenuCard({ item, onAddToCart, inCart }: MenuCardProps) {
  const [avgRating, setAvgRating] = useState(item.averageRating);
  const [ratingCount, setRatingCount] = useState(item.ratingCount);
  const [rated, setRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingError, setRatingError] = useState(false);

  const handleRate = async (rating: number) => {
    if (rated || ratingLoading) return;
    setRatingLoading(true);
    setRatingError(false);
    try {
      const res = await rateItem(item.id, rating);
      setAvgRating(res.averageRating);
      setRatingCount(res.ratingCount);
      setRated(true);
    } catch {
      setRatingError(true);
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group">
      {/* Image */}
      <div className="relative overflow-hidden h-48 sm:h-52">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${categoryColors[item.category] ?? "bg-gray-100 text-gray-700"}`}>
            {item.category}
          </span>
        </div>
        {item.tags.includes("bestseller") && (
          <div className="absolute top-3 right-3 bg-[#D4A017] text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
            🔥 Bestseller
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-[#2C1810] text-base leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>
            {item.name}
          </h3>
          <span className="text-[#D4A017] font-bold text-lg shrink-0">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="text-[#2C1810]/60 text-sm leading-relaxed mb-3 flex-1">
          {item.description}
        </p>

        {/* Tags */}
        {item.tags.filter((t) => t !== "bestseller").length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.filter((t) => t !== "bestseller").map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 bg-[#F5E6C8] text-[#8B5E3C] rounded-full capitalize">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="mb-4">
          {rated ? (
            <p className="text-xs text-green-600 font-medium">✓ Thanks for your rating!</p>
          ) : ratingError ? (
            <p className="text-xs text-red-500">Couldn't save rating — try again later.</p>
          ) : (
            <div className="flex items-center gap-2">
              <StarRating
                value={avgRating}
                count={ratingCount}
                interactive={!ratingLoading}
                onRate={handleRate}
                size={15}
              />
              <span className="text-xs text-[#2C1810]/40">
                {ratingLoading ? "Saving…" : "Rate this"}
              </span>
            </div>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={() => onAddToCart(item)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
            inCart
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-[#2C1810] text-[#F5E6C8] hover:bg-[#3D2418] active:scale-95"
          }`}
        >
          {inCart ? (
            <>
              <Check size={16} /> Added to Cart
            </>
          ) : (
            <>
              <Plus size={16} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
