// src/api/api.js
import axios from 'axios';

// Pour le web (localhost:8081), l'API tourne sur localhost:3000
// const BASE_URL = 'http://localhost:3000/api';
const BASE_URL = 'https://gestemploye-backend.onrender.com/api';

const API = axios.create({ baseURL: BASE_URL, timeout: 10000 });

export const getEmployes   = ()      => API.get('/employes');
export const getEmploye    = (id)    => API.get(`/employes/${id}`);
export const createEmploye = (data)  => API.post('/employes', data);
export const updateEmploye = (id, d) => API.put(`/employes/${id}`, d);
export const deleteEmploye = (id)    => API.delete(`/employes/${id}`);

export default API;

// import axios from 'axios';
 
// // ⚠️ Remplacez par l'IP de votre ordinateur sur le réseau local
// // Sur Android émulateur : 10.0.2.2
// // Sur appareil physique  : 192.168.x.x (votre IP locale)
// const BASE_URL = 'http://10.0.2.2:3000/api';
 
// const API = axios.create({ baseURL: BASE_URL, timeout: 10000 });
 
// export const getEmployes     = ()       => API.get('/employes');
// export const getEmploye      = (id)     => API.get(`/employes/${id}`);
// export const createEmploye   = (data)   => API.post('/employes', data);
// export const updateEmploye   = (id, d)  => API.put(`/employes/${id}`, d);
// export const deleteEmploye   = (id)     => API.delete(`/employes/${id}`);
 
// export default API;
