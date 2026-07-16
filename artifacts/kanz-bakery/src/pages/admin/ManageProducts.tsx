import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X, Package, Star, Eye, EyeOff } from "lucide-react";

interface Product {
  id: string; name: string; category: string; description: string;
  price: number; image: string; tags: string[]; available: boolean;
  averageRating: number | null; ratingCount: number;
}
interface Category { id: string; label: string; }

const EMPTY_FORM = { name: "", category: "", description: "", price: "", image: "", tags: "", available: true };

export default function ManageProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_FORM });
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<typeof EMPTY_FORM & { available: boolean }>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/admin/products", { credentials: "include" }),
        fetch("/api/admin/categories", { credentials: "include" }),
      ]);
      if (!pRes.ok || !cRes.ok) return;
      const { products: p } = await pRes.json() as { products: Product[] };
      const { categories: c } = await cRes.json() as { categories: Category[] };
      setProducts(p ?? []);
      setCategories(c ?? []);
    } catch { /* network error — leave state as empty arrays */ }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchAll(); }, []);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleAdd = async () => {
    if (!addForm.name || !addForm.category || !addForm.price) { setError("Name, category and price are required"); return; }
    setSaving(true); setError(null);
    const res = await fetch("/api/admin/products", {
      method: "POST", headers: {"Content-Type":"application/json"}, credentials:"include",
      body: JSON.stringify({ ...addForm, price: parseFloat(addForm.price), tags: addForm.tags.split(",").map(t => t.trim()).filter(Boolean) }),
    });
    if (!res.ok) { const d = await res.json() as { error: string }; setError(d.error); } else { setShowAdd(false); setAddForm({ ...EMPTY_FORM }); fetchAll(); }
    setSaving(false);
  };

  const startEdit = (p: Product) => {
    setEditId(p.id);
    setEditForm({ name: p.name, category: p.category, description: p.description, price: String(p.price), image: p.image, tags: p.tags.join(", "), available: p.available });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    await fetch(`/api/admin/products/${id}`, {
      method: "PATCH", headers: {"Content-Type":"application/json"}, credentials:"include",
      body: JSON.stringify({ ...editForm, price: parseFloat(editForm.price ?? "0"), tags: (editForm.tags ?? "").split(",").map(t => t.trim()).filter(Boolean) }),
    });
    setEditId(null); setSaving(false); fetchAll();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
    fetchAll();
  };

  const toggleAvailable = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify({ available: !p.available }) });
    fetchAll();
  };

  const FormFields = ({ form, setForm }: { form: typeof EMPTY_FORM & { available?: boolean }, setForm: (f: any) => void }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Product Name *</label>
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Sourdough Loaf"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
        <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40">
          <option value="">Select…</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
        <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe the product…"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 resize-none" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Price ($) *</label>
        <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="4.50"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Tags <span className="text-gray-400">(comma-separated)</span></label>
        <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="bestseller, vegan, signature"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40" />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-600 mb-1">Image URL *</label>
        <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://images.unsplash.com/…"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="avail" checked={form.available ?? true} onChange={e => setForm({...form, available: e.target.checked})} className="rounded" />
        <label htmlFor="avail" className="text-sm text-gray-600">Available for sale</label>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} products · {products.filter(p => !p.available).length} unavailable</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(null); }} className="flex items-center gap-1.5 bg-[#D4A017] hover:bg-[#E8B82A] text-[#2C1810] font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-[#D4A017]/30 p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">New Product</h3>
          <FormFields form={addForm as any} setForm={setAddForm} />
          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          <div className="flex gap-2 mt-4">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1.5 bg-[#2C1810] hover:bg-[#3D2418] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              <Save size={13} /> {saving ? "Saving…" : "Add Product"}
            </button>
            <button onClick={() => { setShowAdd(false); setError(null); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 flex-1" />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40">
          <option value="all">All categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="bg-white rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : editId ? (
        // Inline edit view
        <div className="bg-white rounded-xl border border-[#D4A017]/30 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Edit Product</h3>
            <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <FormFields form={editForm as any} setForm={setEditForm} />
          <div className="flex gap-2 mt-4">
            <button onClick={() => saveEdit(editId)} disabled={saving} className="flex items-center gap-1.5 bg-[#2C1810] hover:bg-[#3D2418] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50">
              <Save size={13} /> {saving ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={() => setEditId(null)} className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No products found</div>}
          {filtered.map((product) => (
            <div key={product.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${product.available ? "border-gray-100" : "border-red-100 opacity-70"}`}>
              <div className="relative h-36">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                  <span className="text-white font-semibold text-sm drop-shadow">{product.name}</span>
                  <span className="text-[#D4A017] font-bold text-base drop-shadow">${product.price.toFixed(2)}</span>
                </div>
                {!product.available && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">Unavailable</div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-xs text-gray-400 capitalize bg-gray-50 px-2 py-0.5 rounded-full">{product.category}</span>
                  {product.averageRating && (
                    <span className="text-xs text-[#D4A017] flex items-center gap-0.5"><Star size={10} fill="currentColor" /> {product.averageRating.toFixed(1)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{product.description}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => startEdit(product)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 py-1.5 rounded-lg border border-gray-200 hover:border-blue-200 transition-all">
                    <Pencil size={12} /> Edit
                  </button>
                  <button onClick={() => toggleAvailable(product)} className="flex items-center justify-center gap-1 text-xs font-medium bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 py-1.5 px-2.5 rounded-lg border border-gray-200 hover:border-amber-200 transition-all">
                    {product.available ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="flex items-center justify-center gap-1 text-xs font-medium bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 py-1.5 px-2.5 rounded-lg border border-gray-200 hover:border-red-200 transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
