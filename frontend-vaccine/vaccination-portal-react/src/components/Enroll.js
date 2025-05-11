import React, { useEffect, useState } from 'react';
import API from '../api';
import { bulkVaccinate, adjustDriveSlots } from '../api';


/* ---------- helpers ---------- */
const isPast = (dateStr) =>
  new Date(dateStr) < new Date(new Date().toDateString());

/* ------------------------------------------------------------------ */
export default function Enroll() {
  /* --- state ------------------------------------------------------ */
  const [drives,   setDrives]   = useState([]);   // every drive gets idSafe
  const [students, setStudents] = useState([]);   // every student gets uid

  const [driveId,  setDriveId]  = useState('');   // idSafe string
  const [selected, setSelected] = useState(new Set()); // Set<uid>
  const [busy,     setBusy]     = useState(false);

  /* --- load lists ------------------------------------------------- */
  const load = async () => {
    const [d, s] = await Promise.all([
      API.get('/drives'),
      API.get('/students')
    ]);

    /* drive list: keep expired drives (disabled later), ensure idSafe string */
    const driveList = d.data.map((v, idx) => ({
      ...v,
      idSafe    : String(v.id ?? v._id ?? idx),   // for <select>
      backendId : String(v._id ?? v.id ?? idx)    // always rea
    }));
    setDrives(driveList);

    /* student list: add uid (always unique, non-undefined) */
    const studentList = s.data.map((v, idx) => ({
      ...v,
      uid: String(v.id ?? v._id ?? idx)
    }));
    setStudents(studentList);

    /* if current drive disappeared (e.g. deleted) clear selection */
    if (driveId && !driveList.some(d => d.idSafe === driveId)) {
      setDriveId('');
      setSelected(new Set());
    }
  };

  /* run once on mount */
  useEffect(() => { load(); }, []);      // arrow fn avoids “destroy” warning

  /* --- derived values -------------------------------------------- */
  const drive    = drives.find(d => d.idSafe === driveId);
  const expired  = !!drive && isPast(drive.date);
  const slots    = drive ? drive.availableDoses : 0;
  const picked   = selected.size;

  /* --- checkbox toggle ------------------------------------------- */
  const toggle = (uid) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(uid) ? next.delete(uid) : next.add(uid);
      return next;
    });
  };

  /* --- enroll save ----------------------------------------------- */
  const enroll = async () => {
    if (!drive)      return alert('Pick a drive first');
    if (expired)     return alert('Drive is expired');
    if (!picked)     return alert('Select at least one student');
    if (picked > slots) return alert('Selection exceeds available slots');

    try {
      setBusy(true);

    //   /* 1 – mark students vaccinated */
    //   await API.patch('/students/bulk-vaccinate', {
    //     driveId   : drive.id,                 // backend id
    //     studentIds: Array.from(selected)      // uids (must match backend IDs)
    //   });

    //   /* 2 – update drive slot counts */
    //   await API.patch(`/drives/${drive.id}/adjust-slots`, {
    //     used: picked                         // how many just enrolled
    //   });
    await bulkVaccinate(drive.backendId, Array.from(selected));
    await adjustDriveSlots(drive.backendId, picked);

      alert('Enrollment saved');
      setSelected(new Set());
      await load();                          // refresh lists
    } catch (err) {
      const { status, data } = err.response || {};
      alert(status === 400 && data?.message ? data.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  /* --- UI --------------------------------------------------------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>Enroll Students into a Drive</h2>

      {/* ---------- drive selector ---------- */}
      <label>
        Select drive:{' '}
        <select
          value={driveId}
          onChange={e => {
            setDriveId(e.target.value);
            setSelected(new Set());
          }}
        >
          <option value="">-- choose --</option>
          {drives.map(d => {
            const past = isPast(d.date);
            return (
              <option
                key={d.idSafe}
                value={d.idSafe}
                disabled={past}
                style={past ? { color:'#888' } : null}
              >
                {d.vaccineName} — {new Date(d.date).toLocaleDateString()}
                {past
                  ? ' (expired)'
                  : ` (left ${d.availableDoses} / done ${d.vaccinatedCount ?? 0})`}
              </option>
            );
          })}
        </select>
      </label>

      {/* ---------- student table ---------- */}
      {drive && (
        <>
          <p style={{ marginTop: 8 }}>
            {picked} / {slots} selected {expired && <span style={{color:'red'}}>(expired)</span>}
          </p>

          <table border="1" style={{ marginTop: 8, maxWidth:'100%' }}>
            <thead>
              <tr>
                <th/>
                <th>ID</th><th>Name</th><th>Grade</th><th>Class</th>
              </tr>
            </thead>
            <tbody>
              {students.map(st => {
                const checked  = selected.has(st.uid);
                const disable  = expired || (!checked && picked >= slots);

                return (
                  <tr key={st.uid}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disable}
                        onChange={() => toggle(st.uid)}
                      />
                    </td>
                    <td>{st.studentId}</td>
                    <td>{st.firstName} {st.lastName}</td>
                    <td>{st.grade}</td>
                    <td>{st.class}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button
            style={{ marginTop: 12 }}
            disabled={busy || expired || !picked}
            onClick={enroll}
          >
            {expired ? 'Drive expired'
                     : busy    ? 'Saving…'
                     : 'Enroll'}
          </button>
        </>
      )}
    </div>
  );
}
