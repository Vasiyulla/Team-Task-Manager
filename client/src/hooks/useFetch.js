import { useEffect, useState, useCallback } from 'react';
import apiClient from '../api/apiClient.js';

export const useFetch = (url, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(url);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) {
      fetch();
    }
  }, [url, fetch, ...dependencies]);

  return { data, loading, error, refetch: fetch };
};
