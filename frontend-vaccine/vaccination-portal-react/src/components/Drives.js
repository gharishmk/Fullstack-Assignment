import React, { useEffect, useState } from 'react';
import {
  getDrives,
  createDrive,
  updateDriveById
} from '../api';

const gradeList  = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const classList  = ['A','B','C','D','E'];

export default function Drives() {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(blank());

  function blank() {
    return {
      vaccineName:'', date:'', availableDoses:'',
      applicableGrades:[], applicableClasses:[], notes:''
    };
  }

  const reload = () => getDrives().then(r => setRows(r.data));
  useEffect(() => { reload(); }, []);

  const isPast = d => new Date(d) < new Date(new Date().toDateString());

  /* ---------- helpers ---------- */
  const toggleArr = (key,val) =>
    setForm(f=>{
      const has = f[key].includes(val);
      return { ...f,
        [key]: has ? f[key].filter(v=>v!==val) : [...f[key], val]
      };
    });

  const startEdit = d => {
    setEditingId(d._id);
    setForm({...d});
  };
  const cancel = ()=>{ setEditingId(''); setForm(blank()); };

  const save = async () => {
    if (editingId) {
      await updateDriveById(editingId, form);
    } else {
      await createDrive(form);
    }
    cancel();
    reload();
  };

  /* ---------- ui ---------- */
  return (
    <div style={{ padding:20 }}>
      <h2>Vaccination Drives</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Vaccine</th><th>Date</th><th>Doses</th>
            <th>Grades</th><th>Classes</th><th>Notes</th><th/>
          </tr>
        </thead>
        <tbody>
          {rows.map(d=>{
            const past = isPast(d.date);
            return (
              <tr key={d._id}>
                <td>{d.vaccineName}</td>
                <td>{new Date(d.date).toLocaleDateString()}</td>
                <td>{d.availableDoses}</td>
                <td>{d.applicableGrades.join(',')}</td>
                <td>{d.applicableClasses.join(',')}</td>
                <td>{d.notes}</td>
                <td>
                  <button disabled={past} onClick={()=>startEdit(d)}>
                    Edit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 style={{marginTop:16}}>
        {editingId ? 'Edit Drive' : 'Create Drive'}
      </h3>

      {/* simple form */}
      <div style={{display:'flex',flexDirection:'column',gap:6,maxWidth:340}}>
        <input placeholder="Vaccine name"
               value={form.vaccineName}
               onChange={e=>setForm({...form,vaccineName:e.target.value})}/>
        <input type="date"
               value={form.date?.slice(0,10)}
               onChange={e=>setForm({...form,date:e.target.value})}/>
        <input type="number" placeholder="Available doses"
               value={form.availableDoses}
               onChange={e=>setForm({...form,availableDoses:e.target.value})}/>

        <fieldset><legend>Grades</legend>
          {gradeList.map(g=>(
            <label key={g} style={{marginRight:6}}>
              <input type="checkbox"
                     checked={form.applicableGrades.includes(g)}
                     onChange={()=>toggleArr('applicableGrades',g)}/> {g}
            </label>
          ))}
        </fieldset>

        <fieldset><legend>Classes</legend>
          {classList.map(c=>(
            <label key={c} style={{marginRight:6}}>
              <input type="checkbox"
                     checked={form.applicableClasses.includes(c)}
                     onChange={()=>toggleArr('applicableClasses',c)}/> {c}
            </label>
          ))}
        </fieldset>

        <textarea rows={2} placeholder="Notes"
                  value={form.notes}
                  onChange={e=>setForm({...form,notes:e.target.value})}/>
      </div>

      <button onClick={save} style={{marginTop:8}}>
        {editingId ? 'Save' : 'Create'}
      </button>
      {editingId && <button onClick={cancel} style={{marginLeft:6}}>Cancel</button>}
    </div>
  );
}
