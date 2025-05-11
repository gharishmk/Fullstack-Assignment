import React, { useEffect, useState } from 'react';
import { utils, writeFile } from 'xlsx';
import API from '../api';

export default function Reports() {
  /* --------------- state ---------------- */
  const [rows, setRows]       = useState([]);
  const [filterVaccine, setFilterVaccine] = useState('');
  const [from, setFrom]       = useState('');
  const [to,   setTo]         = useState('');

  /* --------------- fetch & flatten ------ */
  useEffect(() => {
    (async () => {
      const res = await API.get('/students');
      const flat = [];
      res.data.forEach(st => {
        st.vaccinationStatus.forEach(v => {
          flat.push({
            studentId  : st.studentId,
            name       : `${st.firstName} ${st.lastName}`,
            grade      : st.grade,
            class      : st.class,
            vaccine    : v.vaccineName,
            doseNumber : v.doseNumber,
            vaccDate   : v.date ? new Date(v.date) : null,
            driveDate  : v.driveId?.date ? new Date(v.driveId.date) : null,
            driveStatus: v.driveId?.status || ''
          });
        });
      });
      setRows(flat);
    })();
  }, []);

  /* --------------- filtering ------------ */
  const filtered = rows.filter(r => {
    if (filterVaccine && r.vaccine !== filterVaccine) return false;
    if (from && r.vaccDate && r.vaccDate < new Date(from)) return false;
    if (to   && r.vaccDate && r.vaccDate > new Date(to))   return false;
    return true;
  });

  /* --------------- export helpers ------- */
  const exportExcel = () => {
    const xrows = filtered.map(r => ({
      StudentID     : r.studentId,
      Name          : r.name,
      Grade         : r.grade,
      Class         : r.class,
      Vaccine       : r.vaccine,
      Dose          : r.doseNumber,
      VaccinatedOn  : r.vaccDate?.toLocaleDateString(),
      DriveDate     : r.driveDate ?.toLocaleDateString(),
      DriveStatus   : r.driveStatus
    }));
    const ws = utils.json_to_sheet(xrows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, 'vaccination-report.xlsx');
  };

  const exportCSV = () => {
    const xrows = filtered.map(r => ({
      StudentID     : r.studentId,
      Name          : r.name,
      Grade         : r.grade,
      Class         : r.class,
      Vaccine       : r.vaccine,
      Dose          : r.doseNumber,
      VaccinatedOn  : r.vaccDate?.toISOString(),
      DriveDate     : r.driveDate?.toISOString(),
      DriveStatus   : r.driveStatus
    }));
    const csv = [
      Object.keys(xrows[0]).join(','),
      ...xrows.map(o => Object.values(o).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vaccination-report.csv';
    a.click();
  };

  /* --------------- unique vaccine list -- */
  const vaccines = [...new Set(rows.map(r => r.vaccine))];

  /* --------------- UI ------------------- */
  return (
    <div style={{ padding: 20 }}>
      <h2>Vaccination Reports</h2>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
        <select value={filterVaccine} onChange={e=>setFilterVaccine(e.target.value)}>
          <option value="">All vaccines</option>
          {vaccines.map(v=> <option key={v}>{v}</option>)}
        </select>
        <label>From <input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
        <label>To <input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
        <button onClick={()=>{setFilterVaccine('');setFrom('');setTo('');}}>Clear</button>
      </div>

      {/* Table */}
      <table border="1" style={{ maxWidth:'100%' }}>
        <thead>
          <tr>
            <th>ID</th><th>Name</th><th>Grade</th><th>Class</th>
            <th>Vaccine</th><th>Dose</th>
            <th>Vaccinated&nbsp;On</th>
            <th>Drive&nbsp;Date</th>
            <th>Drive&nbsp;Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan="9" style={{ textAlign:'center' }}>
              No records
            </td></tr>
          )}
          {filtered.map((r,i)=>(
            <tr key={i}>
              <td>{r.studentId}</td>
              <td>{r.name}</td>
              <td>{r.grade}</td>
              <td>{r.class}</td>
              <td>{r.vaccine}</td>
              <td>{r.doseNumber}</td>
              <td>{r.vaccDate?.toLocaleDateString()}</td>
              <td>{r.driveDate?.toLocaleDateString()}</td>
              <td>{r.driveStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Export buttons */}
      {filtered.length > 0 && (
        <div style={{ marginTop: 10, display:'flex', gap:8 }}>
          <button onClick={exportCSV}>Export CSV</button>
          <button onClick={exportExcel}>Export Excel</button>
        </div>
      )}
    </div>
  );
}
