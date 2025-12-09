import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

/* Trainers Management
- List trainers
- Add/Edit trainer profile including role (Head/Assistant) and shifts
- Shift represented as simple objects (day + start + end)
*/

type Shift = { day: string; start: string; end: string };

type Trainer = {
  id: string;
  name: string;
  email?: string;
  role?: "Head" | "Coach" | "Assistant";
  shifts?: Shift[];
};

const sampleShifts: Shift[] = [
  { day: "شنبه", start: "08:00", end: "12:00" },
  { day: "دوشنبه", start: "14:00", end: "18:00" },
];

const Trainers: React.FC = () => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [editing, setEditing] = useState<Trainer | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // try fetch
    (async () => {
      try {
        const res = await fetch('/api/gymadmin/trainers');
        if (res.ok) { setTrainers(await res.json()); return; }
      } catch (e) {}

      // fallback
      setTrainers([
        { id: 't1', name: 'علی حسینی', email: 'ali@example.com', role: 'Head', shifts: sampleShifts },
        { id: 't2', name: 'مینا رضایی', email: 'mina@example.com', role: 'Coach', shifts: [{ day: 'سه‌شنبه', start: '10:00', end: '14:00' }] },
      ]);
    })();
  }, []);

  const openNew = () => setEditing({ id: '', name: '', email: '', role: 'Coach', shifts: [] });
  const openEdit = (t: Trainer) => setEditing({...t});
  const close = () => { setEditing(null); setShowModal(false); };

  const save = async (t: Trainer) => {
    try {
      if (!t.id) {
        const res = await fetch('/api/gymadmin/trainers', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(t) });
        if (res.ok) { const created = await res.json(); setTrainers(prev => [created, ...prev]); close(); return; }
      } else {
        const res = await fetch(`/api/gymadmin/trainers/${t.id}`, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(t) });
        if (res.ok) { setTrainers(prev => prev.map(x => x.id === t.id ? t : x)); close(); return; }
      }
    } catch (e) {}

    if (!t.id) t.id = uuidv4();
    setTrainers(prev => t.id ? prev.map(x => x.id === t.id ? t : x) : [t, ...prev]);
    close();
  };

  const remove = async (id: string) => {
    if (!confirm('آیا حذف می‌شود؟')) return;
    try { const res = await fetch(`/api/gymadmin/trainers/${id}`, { method: 'DELETE' }); if (res.ok) { setTrainers(prev => prev.filter(p=>p.id !== id)); return; } } catch (e) {}
    setTrainers(prev => prev.filter(p=>p.id !== id));
  };

  const addShift = () => {
    if (!editing) return;
    const s = { day: 'شنبه', start: '08:00', end: '12:00' };
    setEditing({...editing, shifts: [...(editing.shifts||[]), s]});
  };

  const updateShift = (index: number, key: keyof Shift, value: string) => {
    if (!editing) return;
    const shifts = (editing.shifts||[]).map((s,i)=> i===index ? {...s,[key]:value} : s);
    setEditing({...editing, shifts});
  };

  return (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">مدیریت مربیان</h2>
        <div>
          <button onClick={()=>{openNew(); setShowModal(true)}} className="bg-[var(--primary)] px-3 py-2 rounded">افزودن مربی</button>
        </div>
      </div>

      <div className="grid gap-3">
        {trainers.map(t => (
          <div key={t.id} className="bg-[var(--card)] p-3 rounded flex justify-between items-center">
            <div>
              <div className="font-bold">{t.name} <span className="opacity-70 text-sm">{t.role}</span></div>
              <div className="opacity-70 text-sm">{t.email}</div>
              <div className="mt-2 text-sm">شیفت‌ها: {(t.shifts||[]).map(s=>`${s.day} ${s.start}-${s.end}`).join(' | ')}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-2 py-1 border" onClick={()=>{openEdit(t); setShowModal(true)}}>ویرایش</button>
              <button className="px-2 py-1 bg-red-400" onClick={()=>remove(t.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-[var(--bg)] rounded p-4 w-full max-w-2xl">
            <h3 className="text-lg font-bold">{editing.id ? 'ویرایش مربی' : 'افزودن مربی'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
              <input placeholder="نام" value={editing.name} onChange={e=>setEditing({...editing!, name: e.target.value})} className="p-2 border rounded" />
              <input placeholder="ایمیل" value={editing.email} onChange={e=>setEditing({...editing!, email: e.target.value})} className="p-2 border rounded" />
              <select value={editing.role} onChange={e=>setEditing({...editing!, role: e.target.value as any})} className="p-2 border rounded">
                <option value="Head">Head</option>
                <option value="Coach">Coach</option>
                <option value="Assistant">Assistant</option>
              </select>

              <div className="col-span-1 md:col-span-2">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">شیفت‌ها</div>
                  <button className="px-2 py-1 bg-[var(--primary)] rounded" onClick={addShift}>افزودن شیفت</button>
                </div>

                <div className="grid gap-2 mt-2">
                  {(editing.shifts||[]).map((s, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input className="p-2 border rounded" value={s.day} onChange={e=>updateShift(idx, 'day', e.target.value)} />
                      <input className="p-2 border rounded" value={s.start} onChange={e=>updateShift(idx, 'start', e.target.value)} />
                      <input className="p-2 border rounded" value={s.end} onChange={e=>updateShift(idx, 'end', e.target.value)} />
                    </div>
                  ))}
                </div>

              </div>

            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button className="px-3 py-2 border" onClick={close}>انصراف</button>
              <button className="px-3 py-2 bg-[var(--primary)]" onClick={()=>save(editing!)}>ذخیره</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Trainers;
