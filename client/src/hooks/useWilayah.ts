import { useState, useEffect } from 'react';
import api from '../lib/api';
import { WilayahOption } from '../types';

// Hook untuk fetch daftar kecamatan
export function useKecamatan(idkab: string) {
  const [data, setData]       = useState<WilayahOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idkab) return;

    setLoading(true);
    api.get('/wilayah/kecamatan', { params: { idkab } })
      .then(res => setData(res.data))
      .catch(err => console.error('useKecamatan error:', err))
      .finally(() => setLoading(false));
  }, [idkab]);

  return { data, loading };
}

// Hook untuk fetch daftar nagari
export function useNagari(idkec: string) {
  const [data, setData]       = useState<WilayahOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idkec) { setData([]); return; }

    setLoading(true);
    api.get('/wilayah/nagari', { params: { idkec } })
      .then(res => setData(res.data))
      .catch(err => console.error('useNagari error:', err))
      .finally(() => setLoading(false));
  }, [idkec]);

  return { data, loading };
}

// Hook untuk fetch daftar korong
export function useKorong(iddesa: string) {
  const [data, setData]       = useState<WilayahOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!iddesa) { setData([]); return; }

    setLoading(true);
    api.get('/wilayah/korong', { params: { iddesa } })
      .then(res => setData(res.data))
      .catch(err => console.error('useKorong error:', err))
      .finally(() => setLoading(false));
  }, [iddesa]);

  return { data, loading };
}
