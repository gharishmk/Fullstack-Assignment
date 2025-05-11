
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL ||  'http://localhost:5500/api',
  headers: { 'Content-Type': 'application/json' }
});


API.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createStudent      = (body:any)         => API.post ('/students', body);
export const updateStudent      = (id:string, body:any)=> API.put  (`/students/${id}`, body);
export const deleteStudent      = (id:string)         => API.delete(`/students/${id}`);
export const getStudents        = (params:any={})     => API.get  ('/students',{ params });

/* NEW → mark many students vaccinated in one call */
export const bulkVaccinate = (driveId:string, studentIds:string[]) =>
  API.patch('/students/bulk-vaccinate', { driveId, studentIds });

export const createDrive        = (body:any)          => API.post ('/drives', body);
export const updateDrive        = (id:string, body:any)=> API.put  (`/drives/${id}`, body);
export const deleteDrive        = (id:string)          => API.delete(`/drives/${id}`);
export const getDrives          = (params:any={})      => API.get  ('/drives', { params });


export const adjustDriveSlots = (driveId:string, used:number) =>
  API.patch(`/drives/${driveId}/adjust-slots`, { used });

export const updateStudentById = (id: string, body: any) =>
  API.put(`/students/${id}`, body);

export const updateDriveById = (id: string, body: any) =>
  API.put(`/drives/${id}`, body);



export default API;

