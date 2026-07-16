import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Save, X, Tag } from "lucide-react";

interface Category { id: string; name: string; label: string; color: string; }

const COLOR_OPTIONS = [
  { value: "bg-amber-100 text-amber-800",   preview: "bg-amber-200",   label: "Amber"  },
  { value: "bg-rose-100 text-rose-700",     preview: "bg-rose-200",    label: "Rose"   },
  { value: "bg-purple-100 text-purple-700", preview: "bg-purple-200",  label: "Purple" },
  { value: "bg-orange-100 text-orange-700", preview: "bg-orange-200",  label: "Orange" },
  { value: "bg-sky-100 text-sky-700",       preview: "bg-sky-200",     label: "Sky"    },
  { value: "bg-green-100 text-green-700",   preview: "bg-green-200",   label: "Green"  },
  { value: "bg-pink-100 text-pink-700",     preview: "bg-pink-200",    label: "Pink"   },
  { value: "bg-teal-100 text-teal-700",     preview: "bg-teal-200",    label: "Teal"   },
];

const EMPTY = { name: "", label: "", color: COLOR_OPTIONS[0].value };

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [addForm, setAddForm] = useState({ ...EMPTY });
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json() as { categories: Category[] };
      setCategories(data.categories ?? []);
    } catch { /* network error — leave state as empty array */ }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchCats(); }, []);

  const handleEdit = (cat: Category) => { setEditId(cat.id); setEditForm({ label: cat.label, color: cat.color }); };
  const cancelEdit = () => { setEditId(null); setEditForm({}); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    await fetch(`/api/admin/categories/${id}`, { method: "PATCH", headers: {"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify(editForm) });
    setEditId(null);
    setSaving(false);
    fetchCats();
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Delete this category? Menu items in it won't be deleted, just uncategorized.")) return;
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE", credentials: "include" });
    fetchCats();
  };

  const handleAdd = async () => {
    if (!addForm.name || !addForm.label) { setError("Name and label are required"); return; }
    if (!/^[a-z0-9-]+$/.test(addForm.name)) { setError("Name must be lowercase letters/numbers/hyphens only"); return; }
    setSaving(true);
    setError(null);
    const res = await fetch("/api/admin/categories", { method: "POST", headers: {"Content-Type":"application/json"}, credentials:"include", body: JSON.stringify(addForm) });
    if (!res.ok) { const d = await res.json() as { error: string }; setError(d.error); } else { setShowAdd(false); setAddForm({ ...EMPTY }); fetchCats(); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories total</p>
        </div>
        <button onClick={() => { setShowAdd(true); setError(null); }} className="flex items-center gap-1.5 bg-[#D4A017] hover:bg-[#E8B82A] text-[#2C1810] font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Add Category
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-[#D4A017]/30 p-5 mb-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">New Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ID / Slug <span className="text-gray-400">(lowercase)</span></label>
              <input value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"")})}
                placeholder="e.g. viennoiserie"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Display Label</label>
              <input value={addForm.label} onChange={e => setAddForm({...addForm, label: e.target.value})}
                placeholder="e.g. Viennoiserie"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Badge Color</label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(c => (
                  <button key={c.value} type="button" onClick={() => setAddForm({...addForm, color: c.value})}
                    title={c.label}
                    className={`w-7 h-7 rounded-full ${c.preview} border-2 transition-all ${addForm.color === c.value ? "border-gray-700 scale-110" : "border-transparent"}`} />
                ))}
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={saving} className="flex items-center gap-1.5 bg-[#2C1810] hover:bg-[#3D2418] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              <Save size={13} /> {saving ? "Saving…" : "Save"}
            </button>
            <button onClick={() => { setShowAdd(false); setError(null); }} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
              <X size={13} /> Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Category</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3 hidden sm:table-cell">ID</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Badge</th>
              <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wide px-5 py-3">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    {editId === cat.id ? (
                      <input value={editForm.label ?? ""} onChange={e => setEditForm({...editForm, label: e.target.value})}
                        className="px-2 py-1 border border-[#D4A017]/40 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A017]/40 w-32" />
                    ) : (
                      <div className="flex items-center gap-2"><Tag size={14} className="text-[#D4A017]" /> <span className="font-medium text-gray-900">{cat.label}</span></div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 font-mono text-xs hidden sm:table-cell">{cat.id}</td>
                  <td className="px-5 py-3.5">
                    {editId === cat.id ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {COLOR_OPTIONS.map(c => (
                          <button key={c.value} type="button" onClick={() => setEditForm({...editForm, color: c.value})} title={c.label}
                            className={`w-6 h-6 rounded-full ${c.preview} border-2 transition-all ${(editForm.color ?? cat.color) === c.value ? "border-gray-700 scale-110" : "border-transparent"}`} />
                        ))}
                      </div>
                    ) : (
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cat.color}`}>{cat.label}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {editId === cat.id ? (
                        <>
                          <button onClick={() => saveEdit(cat.id)} disabled={saving} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"><Save size={13} /></button>
                          <button onClick={cancelEdit} className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"><X size={13} /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Pencil size={13} /></button>
                          <button onClick={() => deleteCategory(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"><Trash2 size={13} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
