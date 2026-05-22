import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { Infrastruktur } from '../types';

interface UseInfrastrukturOptions {
  kategori?: string[];
  idkab?: string;
  idkec?: string;
  iddesa?: string;
  idsls?: string;
  enabled?: boolean;
}

export function useInfrastruktur(options: UseInfrastrukturOptions = {}) {
  const { kategori = [], idkab, idkec, iddesa, idsls, enabled = true } = options;

  const [data, setData]       = useState<Infrastruktur[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || kategori.length === 0) { setData([]); return; }

    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (kategori.length > 0) params.kategori = kategori.join(',');
      if (idkab)  params.idkab  = idkab;
      if (idkec)  params.idkec  = idkec;
      if (iddesa) params.iddesa = iddesa;
      if (idsls)  params.idsls  = idsls;

      const res = await api.get('/infrastruktur', { params });
      setData(res.data.data || res.data);
    } catch (err) {
      setError('Gagal memuat data infrastruktur');
      console.error('useInfrastruktur error:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(kategori), idkab, idkec, iddesa, idsls, enabled]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
