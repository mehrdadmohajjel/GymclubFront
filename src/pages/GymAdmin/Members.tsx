import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* Members Management
- List with pagination (client-side)
- Search
- Add / Edit / Delete (modal)
- Uses local state + calls to /api/gymadmin/members (if exists)
*/

type Member = {
  id: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: "active" | "inactive";
};

const emptyMember = (): Member => ({ id: "", firstName: "", lastName: "", email: "", phone: "", status: "active" });

const Members: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [editing, setEditing] = useState<Member | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await fetch("/api/gymadmin/members");
        if (res.ok) {
          const data = await res.json();
          setMembers(data);
          return;
        }
      } catch (e) {
        /* fallthrough to mock */
      }

      // Mock data
const mock = Array.from({ length: 34 }).map((_, i) => ({
  id: `m${i + 1}`,
  firstName: `عضو ${i + 1}`,
  lastName: `خانواده ${i + 1}`,
  email: `member${i + 1}@example.com`,
  phone: `09${100000000 + i}`,
  status: (i % 5 === 0 ? "inactive" : "active") as "active" | "inactive",
}));
setMembers(mock);

    };

    fetchMembers();
  }, []);

  const filtered = members.filter(m => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      m.firstName.toLowerCase().includes(q) ||
      (m.lastName || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q)
    );
  });

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openNew = () => { setEditing(emptyMember()); setShowModal(true); };
  const openEdit = (m: Member) => { setEditing(m); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const saveMember = async (m: Member) => {
    try {
      if (!m.id) {
        // create
        const res = await fetch('/api/gymadmin/members', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(m) });
        if (res.ok) {
          const created = await res.json();
          setMembers(prev => [created, ...prev]);
          closeModal();
          return;
        }
      } else {
        const res = await fetch(`/api/gymadmin/members/${m.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(m) });
        if (res.ok) {
          setMembers(prev => prev.map(x => x.id === m.id ? m : x));
          closeModal();
          return;
        }
      }
    } catch (e) {
      // fallback: local changes
    }

    if (!m.id) {
      m.id = `m${Date.now()}`;
      setMembers(prev => [m, ...prev]);
    } else {
      setMembers(prev => prev.map(x => x.id === m.id ? m : x));
    }

    closeModal();
  };

  const deleteMember = async (id: string) => {
    if (!window.confirm('آیا برای حذف اطمینان دارید؟')) return;
    try {
      const res = await fetch(`/api/gymadmin/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMembers(prev => prev.filter(p => p.id !== id));
        return;
      }
    } catch (e) {}
    // fallback
    setMembers(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">مدیریت ورزشکاران</h2>
        <div className="flex gap-2">
          <input className="p-2 rounded border" placeholder="جستجو بر اساس نام، ایمیل یا تلفن" value={query} onChange={e=>{setQuery(e.target.value); setPage(1);}} />
          <button className="bg-[var(--primary)] text-black rounded px-3 py-2" onClick={openNew}>افزودن ورزشکار</button>
        </div>
      </div>

      <div className="overflow-x-auto bg-[var(--card)] rounded p-3">
        <table className="w-full table-auto">
          <thead>
            <tr className="text-left opacity-80"><th>نام</th><th>ایمیل</th><th>تلفن</th><th>وضعیت</th><th>عملیات</th></tr>
          </thead>
          <tbody>
            {visible.map(m => (
              <tr key={m.id} className="border-b">
                <td>{m.firstName} {m.lastName}</td>
                <td>{m.email}</td>
                <td>{m.phone}</td>
                <td>{m.status}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 rounded border" onClick={()=>openEdit(m)}>ویرایش</button>
                    <button className="px-2 py-1 rounded bg-red-400" onClick={()=>deleteMember(m.id)}>حذف</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div>نمایش {((page-1)*pageSize)+1} - {Math.min(page*pageSize, filtered.length)} از {filtered.length}</div>
        <div className="flex gap-2">
          <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded border">قبلی</button>
          <button disabled={page>=pages} onClick={() => setPage(p => Math.min(p+1, pages))} className="px-3 py-1 rounded border">بعدی</button>
        </div>
      </div>

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-[var(--bg)] rounded p-4 w-full max-w-md">
            <h3 className="text-lg font-bold">{editing.id ? 'ویرایش ورزشکار' : 'افزودن ورزشکار'}</h3>
            <div className="flex flex-col gap-2 mt-3">
              <input placeholder="نام" value={editing.firstName} onChange={e=>setEditing({...editing, firstName: e.target.value})} className="p-2 border rounded" />
              <input placeholder="نام خانوادگی" value={editing.lastName} onChange={e=>setEditing({...editing, lastName: e.target.value})} className="p-2 border rounded" />
              <input placeholder="ایمیل" value={editing.email} onChange={e=>setEditing({...editing, email: e.target.value})} className="p-2 border rounded" />
              <input placeholder="تلفن" value={editing.phone} onChange={e=>setEditing({...editing, phone: e.target.value})} className="p-2 border rounded" />
              <select value={editing.status} onChange={e=>setEditing({...editing, status: e.target.value as any})} className="p-2 border rounded">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button onClick={closeModal} className="px-3 py-2 rounded border">انصراف</button>
              <button onClick={()=>saveMember(editing)} className="px-3 py-2 rounded bg-[var(--primary)]">ذخیره</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;