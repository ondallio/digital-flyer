import { useState, useEffect, useCallback } from 'react';
import { vendorRepository, productRepository } from '../lib/unified-storage';
import type { Vendor, Product } from '../types';

interface UseVendorByTokenResult {
  vendor: Vendor | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVendorByToken(token: string | undefined): UseVendorByTokenResult {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendor = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const v = await vendorRepository.getByEditToken(token);
      if (v) {
        setVendor(v);
        const prods = await productRepository.getByVendorId(v.id);
        setProducts(prods);
      } else {
        setError('유효하지 않은 편집 링크입니다');
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      console.error('Failed to load vendor:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  return { vendor, products, loading, error, refetch: loadVendor };
}

interface UseVendorBySlugResult {
  vendor: Vendor | null;
  products: Product[];
  loading: boolean;
  notFound: boolean;
}

export function useVendorBySlug(slug: string | undefined): UseVendorBySlugResult {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const loadFlyer = async () => {
      try {
        const v = await vendorRepository.getBySlug(slug);
        if (v && v.status === 'active') {
          setVendor(v);
          const prods = await productRepository.getByVendorId(v.id);
          setProducts(prods);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error('Failed to load flyer:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadFlyer();
  }, [slug]);

  return { vendor, products, loading, notFound };
}

interface UseVendorByIdResult {
  vendor: Vendor | null;
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useVendorById(id: string | undefined): UseVendorByIdResult {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendor = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const v = await vendorRepository.getById(id);
      if (v) {
        setVendor(v);
        const prods = await productRepository.getByVendorId(v.id);
        setProducts(prods);
      } else {
        setError('거래처를 찾을 수 없습니다');
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다');
      console.error('Failed to load vendor:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadVendor();
  }, [loadVendor]);

  return { vendor, products, loading, error, refetch: loadVendor };
}
