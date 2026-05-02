import React, { useEffect, useState } from 'react';
import { addPerson, deletePerson, getPersons, updatePerson } from '../../../services/seller/PersonsManagement';

const emptyForm = { name: '', role: 'Actor', country: '', gender: 'Male', age: '', biography: '' };

function PersonsManagement() {
  const [persons, setPersons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [message, setMessage] = useState('');

  const loadPersons = async () => {
    const rows = await getPersons();
    setPersons(rows);
  };

  useEffect(() => {
    loadPersons();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, age: form.age ? Number(form.age) : undefined };
    if (editingId) {
      await updatePerson(editingId, payload);
      setMessage('Person updated.');
    } else {
      await addPerson(payload);
      setMessage('Person added.');
    }
    setForm(emptyForm);
    setEditingId('');
    await loadPersons();
  };

  const editRow = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name || '',
      role: p.role || 'Actor',
      country: p.country || '',
      gender: p.gender || '',
      age: p.age || '',
      biography: p.biography || '',
    });
  };

  const removeRow = async (id) => {
    await deletePerson(id);
    await loadPersons();
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="mh-container py-8 md:py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-cyan-200 mb-8">
          Cast & Crew Management
        </h1>
        <form onSubmit={submit} className="mh-card p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="mh-input" placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
          <select className="mh-input" value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="Actor">Actor</option>
            <option value="Director">Director</option>
          </select>
          <input className="mh-input" placeholder="Country" value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} />
          <select className="mh-input" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input className="mh-input" type="number" placeholder="Age" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} />
          <textarea className="mh-input md:col-span-2 min-h-[90px]" placeholder="Biography" value={form.biography} onChange={(e) => setForm((p) => ({ ...p, biography: e.target.value }))} />
          <div className="md:col-span-2 flex gap-3">
            <button className="mh-btn-primary" type="submit">{editingId ? 'Update Person' : 'Add Person'}</button>
            {editingId && (
              <button type="button" className="mh-btn-secondary" onClick={() => { setEditingId(''); setForm(emptyForm); }}>
                Cancel
              </button>
            )}
          </div>
          {message && <p className="md:col-span-2 text-emerald-300">{message}</p>}
        </form>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full mh-table">
            <thead className="mh-thead">
              <tr>
                <th className="mh-th">Name</th>
                <th className="mh-th">Country</th>
                <th className="mh-th">Role</th>
                <th className="mh-th">Gender</th>
                <th className="mh-th">Age</th>
                <th className="mh-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((p) => (
                <tr key={p._id} className="mh-tr">
                  <td className="mh-td">{p.name}</td>
                  <td className="mh-td">{p.country || '-'}</td>
                  <td className="mh-td">{p.role || '-'}</td>
                  <td className="mh-td">{p.gender || '-'}</td>
                  <td className="mh-td">{p.age || '-'}</td>
                  <td className="mh-td flex gap-2">
                    <button className="mh-btn-secondary text-xs px-3 py-1" onClick={() => editRow(p)}>Edit</button>
                    <button className="mh-btn-danger text-xs px-3 py-1" onClick={() => removeRow(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PersonsManagement;
