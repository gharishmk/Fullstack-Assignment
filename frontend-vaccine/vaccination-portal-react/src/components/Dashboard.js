import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setData(r.data));
  }, []);

  if (!data) return null;

  return (
    <div style={{ padding:20 }}>
      <h1>Dashboard</h1>

      <p>Total Students&nbsp;: {data.totalStudents}</p>
      <p>Vaccinated&nbsp;&nbsp;&nbsp;&nbsp;: {data.vaccinatedStudents}
         &nbsp; ({data.vaccinationPercentage}%)</p>

      <h2 style={{marginTop:24}}>Upcoming Drives (next&nbsp;30&nbsp;days)</h2>
      {data.upcomingDrives.length === 0
        ? <p>No upcoming drives</p>
        : <ul>
            {data.upcomingDrives.map(d=>(
              <li key={d._id}>
                <strong>{d.vaccineName}</strong> — {new Date(d.date)
                  .toLocaleDateString()} ({d.availableDoses} doses)
              </li>
            ))}
          </ul>}
    </div>
  );
}
