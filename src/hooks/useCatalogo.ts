import { useState, useCallback, useEffect } from "react";
import { Diseno, DisenoCounters } from "@/types/diseno.types";
import { getDisenos } from "@/services/diseno.service";
import { toast } from "@/hooks/use-toast";

export const useCatalogo = () => {
  const [disenos, setDisenos] = useState<Diseno[]>([]);
  const [counters, setCounters] = useState<DisenoCounters | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filtroNivel, setFiltroNivel] = useState<string | undefined>(undefined);

  const fetchDisenos = useCallback(async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setNextCursor(null);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await getDisenos({
        nivel: filtroNivel === "all" ? undefined : filtroNivel,
        cursor: reset ? undefined : (nextCursor || undefined),
      });

      setDisenos((prev) => (reset ? response.items : [...prev, ...response.items]));
      setCounters(response.counters);
      setTotal(response.total);
      setNextCursor(response.nextCursor);
    } catch (err: any) {
      setError(err.message || "Error al cargar los diseños");
      toast({
        title: "Error",
        description: err.message || "Error al cargar los diseños",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filtroNivel, nextCursor]);

  useEffect(() => {
    fetchDisenos(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroNivel]);

  const loadMore = () => {
    if (nextCursor && !loading && !loadingMore) {
      fetchDisenos(false);
    }
  };

  const refetch = () => {
    fetchDisenos(true);
  };

  return {
    disenos,
    counters,
    total,
    nextCursor,
    loading,
    loadingMore,
    error,
    filtroNivel,
    setFiltroNivel,
    loadMore,
    refetch,
  };
};
