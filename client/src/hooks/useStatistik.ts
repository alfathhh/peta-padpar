import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Statistik } from '../types';

interface UseStatistikOptions {
  idkab?: string;
  idkec?: string;
  iddesa?: string;
  idsls?: string;
}

export function useStatistik(options: UseStatistikOptions = {}) {
  const { idkab, idkec, iddesa, idsls } = options;

  const [data, setData]       = useState<Statistik[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function fetchStatistik() {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {};
      if (idkab) params.idkab = idkab;
      if (idkec) params.idkec = idkec;
      if (iddesa) params.iddesa = iddesa;
      if (idsls) params.idsls = idsls;

      try {
        const res = await api.get('/statistik', { params });
        if (!ignore) setData(res.data.data || res.data);
      } catch (err) {
        if (ignore) return;
        setError('Gagal memuat data statistik');
        console.error('useStatistik error:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchStatistik();
    return () => { ignore = true; };
  }, [idkab, idkec, iddesa, idsls]);

  return { data, loading, error };
}
