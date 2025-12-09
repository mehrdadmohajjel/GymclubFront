import React, { useEffect, useState } from "react";

/* Buffet Management
- List items
- Add/Edit item
- Record sale (creates sale record, deducts stock)
- Simple sales report by date range
*/

type Item = { id: string; name: string; price: number; stock: number; category?: string };
type Sale = { id: string; itemId: string; qty: number; total: number; date: string; itemName?: string };

const Buffet: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [editing, setEditing] = useState<Item | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  const [sales, setSales] = useState<Sale[]>([]);
  const [reportFrom, setReportFrom] = useState<string>(new Date(new Date().setDate(new Date().getDate()-7)).toISOString().slice(0,10));
  const [reportTo, setReportTo] = useState<string>(new Date().toISOString().slice(0,10));

  useEffect(()=>{
    (async ()=>{
      try {
        const res = await fetch('/api/gymadmin/buffet/items');
        if (res.ok) { setItems(await res.json()); }
      } catch(e) {}

      if (items.length===0) {
        setItems([
          { id: 'i1', name: 'آب معدنی', price: 15000, stock: 40, category: 'نوشیدنی' },
          { id: 'i2', name: 'پروتئین بار', price: 45000, stock: 12, category: 'تنقلات' },
        ]);
      }

      try {
        const r = await fetch('/api/gymadmin/buffet/sales');
        if (r.ok) setSales(await r.json());
      } catch(e) {}

    })();
  }, []);

  const openNew = () => { setEditing({ id: '', name: '', price: 0, stock: 0, category: '' }); setShowItemModal(true); };
  const openEdit = (it: Item) => { setEditing(it); setShowItemModal(true); };
  const closeItemModal = () => { setShowItemModal(false); setEditing(null); };

  const saveItem = async (it: Item) => {
    try {
      if (!it.id) {
        const res = await fetch('/api/gymadmin/buffet/items', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(it) });
        if (res.ok) { const c=await res.json(); setItems(prev=>[c,...prev]); closeItemModal(); return; }
      } else {
        const res = await fetch(`/api/gymadmin/buffet/items/${it.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(it) });
        if (res.ok) { setItems(prev=>prev.map(x=>x.id===it.id?it:x)); closeItemModal(); return; }
      }
    } catch(e) {}

    if (!it.id) it.id = 'i'+Date.now();
    setItems(prev=> it.id ? prev.map(x=>x.id===it.id?it:x) : [it,...prev]);
    closeItemModal();
  };

  const recordSale = async (itemId: string, qty: number) => {
    const item = items.find(i=>i.id===itemId);
    if (!item) return;
    if (qty>item.stock) { alert('موجودی کافی نیست'); return; }

    const sale: Sale = { id: 's'+Date.now(), itemId, qty, total: qty*item.price, date: new Date().toISOString(), itemName: item.name };

    try {
      const res = await fetch('/api/gymadmin/buffet/sales', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(sale) });
      if (res.ok) { const created = await res.json(); setSales(prev=>[created,...prev]); setItems(prev=>prev.map(x=>x.id===itemId?{...x, stock: x.stock-qty}:x)); return; }
    } catch(e) {}

    setSales(prev=>[sale,...prev]);
    setItems(prev=>prev.map(x=>x.id===itemId?{...x, stock: x.stock-qty}:x));
  };

  const report = () => {
    const from = new Date(reportFrom);
    const to = new Date(reportTo);
    return sales.filter(s=>{ const d=new Date(s.date); return d>=from && d<= (new Date(to.getFullYear(), to.getMonth(), to.getDate(),23,59,59)); });
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">مدیریت بوفه</h2>
        <div className="flex gap-2">
          <button onClick={openNew} className="px-3 py-2 rounded bg-[var(--primary)]">افزودن آیتم</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--card)] p-3 rounded">
          <h3 className="font-bold mb-2">اقلام بوفه</h3>
          <div className="grid gap-2">
            {items.map(it=> (
              <div key={it.id} className="flex justify-between items-center p-2 rounded border">
                <div>
                  <div className="font-semibold">{it.name}</div>
                  <div className="text-sm opacity-70">{it.category} • {it.stock} موجود</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-2 py-1 border" onClick={()=>openEdit(it)}>ویرایش</button>
                  <div>
                    <input defaultValue={1} type="number" min={1} max={it.stock} id={`qty-${it.id}`} className="w-20 p-1 border rounded" />
                    <button className="px-2 py-1 bg-[var(--primary)] ml-2" onClick={()=>{ const qty = Number((document.getElementById(`qty-${it.id}`) as HTMLInputElement).value||1); recordSale(it.id, qty); }}>فروش</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--card)] p-3 rounded">
          <h3 className="font-bold mb-2">گزارش فروش</h3>
          <div className="flex gap-2 mb-2">
            <input type="date" value={reportFrom} onChange={e=>setReportFrom(e.target.value)} className="p-2 border rounded" />
            <input type="date" value={reportTo} onChange={e=>setReportTo(e.target.value)} className="p-2 border rounded" />
            <button className="px-3 py-2 bg-[var(--primary)] rounded" onClick={()=>{}}>برو</button>
          </div>

          <div>
            <table className="w-full">
              <thead><tr className="text-left opacity-80"><th>آیتم</th><th>تعداد</th><th>مجموع</th><th>تاریخ</th></tr></thead>
              <tbody>
                {report().map(s=> (
                  <tr key={s.id} className="border-b"><td>{s.itemName}</td><td>{s.qty}</td><td>{s.total.toLocaleString()}</td><td className="opacity-70">{new Date(s.date).toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* Item Modal */}
      {showItemModal && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-[var(--bg)] rounded p-4 w-full max-w-md">
            <h3 className="text-lg font-bold">{editing.id ? 'ویرایش آیتم' : 'افزودن آیتم'}</h3>
            <div className="flex flex-col gap-2 mt-3">
              <input placeholder="نام" value={editing.name} onChange={e=>setEditing({...editing, name: e.target.value})} className="p-2 border rounded" />
              <input placeholder="دسته‌بندی" value={editing.category} onChange={e=>setEditing({...editing, category: e.target.value})} className="p-2 border rounded" />
              <input placeholder="قیمت" value={editing.price} onChange={e=>setEditing({...editing, price: Number(e.target.value)})} className="p-2 border rounded" />
              <input placeholder="موجودی" value={editing.stock} onChange={e=>setEditing({...editing, stock: Number(e.target.value)})} className="p-2 border rounded" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={closeItemModal} className="px-3 py-2 border">انصراف</button>
              <button onClick={()=>saveItem(editing)} className="px-3 py-2 bg-[var(--primary)]">ذخیره</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Buffet;
