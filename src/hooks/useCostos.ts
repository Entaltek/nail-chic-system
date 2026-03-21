import { useState, useEffect, useCallback, useRef } from 'react';
import * as CostosService from '../services/costos.service';
import { toast } from '@/hooks/use-toast';

export const useCostos = () => {
  const [resumen, setResumen] = useState<any>(null);
  const [metaMensual, setMetaMensual] = useState<any>({
    sueldo_base: 0,
    horas_laborales_mes: 160,
    incluir_aguinaldo: false,
    seguro_medico_anual: 0
  });
  
  const [costosFijosGroups, setCostosFijosGroups] = useState<any>({});
  const [costosFijosTotal, setCostosFijosTotal] = useState<number>(0);
  
  const [fondosAhorro, setFondosAhorro] = useState<any[]>([]);
  const [porcentajeAhorroTotal, setPorcentajeAhorroTotal] = useState<number>(0);

  const [tiposGasto, setTiposGasto] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchResumen = async () => {
    try {
      const data = await CostosService.getResumen();
      setResumen(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resData, metaData, fijosData, fondosData, tiposData] = await Promise.all([
        CostosService.getResumen(),
        CostosService.getMetaMensual(),
        CostosService.getCostosFijos(),
        CostosService.getFondosAhorro(),
        CostosService.getTiposGasto(),
      ]);
      setResumen(resData);
      setMetaMensual(metaData);
      setCostosFijosGroups(fijosData.items);
      setCostosFijosTotal(fijosData.meta.total);
      setFondosAhorro(fondosData.items);
      setPorcentajeAhorroTotal(fondosData.meta.porcentaje_total);
      setTiposGasto(tiposData);
    } catch (err: any) {
      toast({ title: "Error de conexión", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Meta Mensual auto-save ---
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateMetaField = (field: string, value: string | number | boolean) => {
    setMetaMensual((prev: any) => ({ ...prev, [field]: value }));

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(async () => {
      try {
        await CostosService.updateMetaMensual({ [field]: value });
        await fetchResumen();
      } catch (err: any) {
        toast({ title: "Error al guardar meta", description: err.message, variant: "destructive" });
      }
    }, 800);
  };

  // --- Costos Fijos ---
  const addCostoFijo = async (payload: any) => {
    await CostosService.createCostoFijo(payload);
    const fijosData = await CostosService.getCostosFijos();
    setCostosFijosGroups(fijosData.items);
    setCostosFijosTotal(fijosData.meta.total);
    await fetchResumen();
  };

  const removeCostoFijo = async (id: string) => {
    await CostosService.deleteCostoFijo(id);
    const fijosData = await CostosService.getCostosFijos();
    setCostosFijosGroups(fijosData.items);
    setCostosFijosTotal(fijosData.meta.total);
    await fetchResumen();
  };

  // --- Fondos Ahorro ---
  const addFondoAhorro = async (payload: any) => {
    await CostosService.createFondoAhorro(payload);
    const fondosData = await CostosService.getFondosAhorro();
    setFondosAhorro(fondosData.items);
    setPorcentajeAhorroTotal(fondosData.meta.porcentaje_total);
    await fetchResumen();
  };

  const removeFondoAhorro = async (id: string) => {
    await CostosService.deleteFondoAhorro(id);
    const fondosData = await CostosService.getFondosAhorro();
    setFondosAhorro(fondosData.items);
    setPorcentajeAhorroTotal(fondosData.meta.porcentaje_total);
    await fetchResumen();
  };

  // --- Tipos Gasto ---
  const fetchTiposGasto = async () => {
    try {
      const data = await CostosService.getTiposGasto();
      setTiposGasto(data);
    } catch (e) {
      console.error(e);
    }
  };

  const addTipoGasto = async (payload: { nombre: string; color: string }) => {
    const nuevo = await CostosService.createTipoGasto(payload);
    await fetchTiposGasto();
    return nuevo;
  };

  const editTipoGasto = async (id: string, payload: { nombre?: string; color?: string }) => {
    const editado = await CostosService.updateTipoGasto(id, payload);
    await fetchTiposGasto();
    return editado;
  };

  const removeTipoGasto = async (id: string) => {
    await CostosService.deleteTipoGasto(id);
    await fetchTiposGasto();
    // After removing, update the groups count reference:
    const fijosData = await CostosService.getCostosFijos();
    setCostosFijosGroups(fijosData.items);
    setCostosFijosTotal(fijosData.meta.total);
  };


  return {
    loading,
    resumen,
    metaMensual,
    updateMetaField,
    
    costosFijosGroups,
    costosFijosTotal,
    addCostoFijo,
    removeCostoFijo,

    fondosAhorro,
    porcentajeAhorroTotal,
    addFondoAhorro,
    removeFondoAhorro,

    tiposGasto,
    addTipoGasto,
    editTipoGasto,
    removeTipoGasto
  };
};
