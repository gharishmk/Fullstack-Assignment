import React, { useState } from 'react';
import API from '../api';

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  const upload = async () => {
    if (!file) { alert('Choose a CSV first'); return; }

    const fd = new FormData();
    fd.append('file', file, file.name);     

    try {
      setBusy(true);
      await API.post('/students/bulk-import', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Upload succeeded');
      setFile(null);
    // } catch (e) {
    //   console.error(e);
    //   alert('Upload failed');
    // }
      }catch (error) {
        const { status, data } = error.response || {};
        if (status === 400 && data?.message) {
            alert(data.message);
        } else {
            alert('Upload failed');
        }
   } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bulk Upload Students</h2>

      <input
        type="file"
        accept=".csv"
        onChange={e => setFile(e.target.files[0] || null)}
      />

      <button onClick={upload} disabled={busy}>
        {busy ? 'Uploading…' : 'Upload'}
      </button>
    </div>
  );
}
