import React, { useEffect, useState } from 'react';
import {
  getStudents,
  createStudent,
  updateStudentById
} from '../api';

export default function Students() {
  const [rows, setRows] = useState([]);
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState(blank());

  function blank() {
    return {
      studentId:'', firstName:'', lastName:'',
      grade:'', class:'', gender:'', parentName:'',
      contactNumber:'', address:'', dateOfBirth:''
    };
  }

  const reload = () => getStudents().then(r => setRows(r.data));
  useEffect(() => { reload(); }, []);

  /* ---------- handlers ---------- */
  const startEdit = s => {
    setEditingId(s._id);
    setForm({ ...s });                 // clone
  };

  const cancel = () => {
    setEditingId('');
    setForm(blank());
  };

  const save = async () => {
    if (editingId) {
      await updateStudentById(editingId, form);
    } else {
      await createStudent(form);
    }
    cancel();
    reload();
  };

  /* ---------- ui ---------- */
  return (
    <div style={{ padding:20 }}>
      <h2>Students</h2>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Grade</th><th>Class</th><th/>
          </tr>
        </thead>
        <tbody>
          {rows.map(s=>(
            <tr key={s._id}>
              <td>{s.studentId}</td>
              <td>{s.firstName} {s.lastName}</td>
              <td>{s.grade}</td>
              <td>{s.class}</td>
              <td>
                <button onClick={()=>startEdit(s)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{marginTop:16}}>
        {editingId ? 'Edit Student' : 'Add Student'}
      </h3>

      {Object.keys(form).map(k=>(
        <input
          key={k}
          placeholder={k}
          value={form[k] || ''}
          onChange={e=>setForm({...form,[k]:e.target.value})}
          style={{ margin:4, maxWidth:180 }}
        />
      ))}
      <div style={{ marginTop:8 }}>
        <button onClick={save}>{editingId ? 'Save' : 'Add'}</button>
        {editingId && <button onClick={cancel} style={{marginLeft:6}}>Cancel</button>}
      </div>
    </div>
  );
}
