export interface Category {
  id: string;
  name: string;
  label: string;
  color: string;
}

export const categories: Category[] = [
  { id: "breads",   name: "breads",   label: "Breads",    color: "bg-amber-100 text-amber-800" },
  { id: "pastries", name: "pastries", label: "Pastries",  color: "bg-rose-100 text-rose-700"   },
  { id: "cakes",    name: "cakes",    label: "Cakes",     color: "bg-purple-100 text-purple-700"},
  { id: "cookies",  name: "cookies",  label: "Cookies",   color: "bg-orange-100 text-orange-700"},
  { id: "drinks",   name: "drinks",   label: "Drinks",    color: "bg-sky-100 text-sky-700"     },
];
