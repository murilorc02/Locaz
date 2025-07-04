import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', 
  headers: {
    'Content-Type': 'application/json'
  },
});

// Interceptor de Requisição: Roda ANTES de cada requisição ser enviada.
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage
    const token = localStorage.getItem('authToken');
    
    // Se o token existir, anexa ele ao cabeçalho de Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Retorna a configuração da requisição para que ela possa continuar
    return config;
  },
  (error) => {
    // Faz alguma coisa com o erro da requisição
    return Promise.reject(error);
  }
);


export default api;