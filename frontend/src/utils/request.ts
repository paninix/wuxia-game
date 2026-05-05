import axios from 'axios';

// 统一API响应类型
export interface IApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 10000,
});

// 请求拦截器（可选，后续可以添加token等）
request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器（统一处理响应和错误）
request.interceptors.response.use(
  (response) => {
    const res = response.data as IApiResponse;
    // 保留原有player接口的兼容性（因为player接口没有统一响应格式）
    if (res.code === undefined) {
      return response;
    }
    if (res.code !== 200) {
      // 可以在这里添加全局错误提示（比如用Element Plus的ElMessage）
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    return response;
  },
  (error) => {
    // 可以在这里添加全局网络错误提示
    return Promise.reject(error);
  }
);

export default request;
