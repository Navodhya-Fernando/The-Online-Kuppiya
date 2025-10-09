import { useState, useCallback } from 'react';

const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunction(...params);
      setData(response.data);
      return response.data;
    } catch (err) {
      // Axios error structure
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
      setError(errorMessage);
      throw err; // Re-throw the error so components can handle it
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute, setData, setError };
};

export default useApi;