import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { clearStoreConfigCache } from '../../../lib/configuracion';
import {
  siteConfig,
  getCurrencyConfig,
  setCurrencyConfig,
} from '../../../config/site';
import {
  DEFAULT_CONTACT_CHANNELS,
  type ContactChannel,
  type ChannelType,
  getActiveChannels,
  getFirstActiveChannel,
  buildChannelActionUrl,
  validatePhone,
  validateSocialHandleOrUrl,
} from '../../../lib/contactChannels';

export interface Sucursal {
  id: string;
  nombre: string;
  ciudad: string;
  direccion: string;
  activa: boolean;
}

const defaultSucursales: Sucursal[] = [
  {
    id: 'suc-1',
    nombre: 'Nodo Central',
    ciudad: 'La Paz',
    direccion: 'Centro Operativo Zairen Lab',
    activa: true,
  },
];

export function ConfiguracionWeb() {
  // Estado sucio para la barra flotante y beforeunload
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const initialSnapshotRef = useRef<string>('');

  // 1. Moneda & Tasa de Cambio
  const [currency, setCurrency] = useState<'BOB' | 'USD'>('BOB');
  const [exchangeRate, setExchangeRate] = useState<number>(6.96);

  // 2. Políticas de Envío & Envío Gratis
  const [shippingCost, setShippingCost] = useState<number>(siteConfig.shipping.expressShippingCost);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState<boolean>(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(
    siteConfig.shipping.freeShippingThreshold
  );
  const [deliveryTime, setDeliveryTime] = useState<string>(siteConfig.shipping.deliveryTimeExpress);

  // 3. Marca
  const [brandName, setBrandName] = useState(siteConfig.name);
  const [brandSlogan, setBrandSlogan] = useState(siteConfig.slogan);

  // 4. Canales de Contacto Unificados & Dinámicos
  const [channels, setChannels] = useState<ContactChannel[]>(DEFAULT_CONTACT_CHANNELS);
  const [previewTab, setPreviewTab] = useState<'card' | 'detail'>('card');
  const [newChannelType, setNewChannelType] = useState<ChannelType>('instagram');
  const [newChannelName, setNewChannelName] = useState<string>('');
  const [newChannelValue, setNewChannelValue] = useState<string>('');
  const [showAddChannel, setShowAddChannel] = useState<boolean>(false);

  // 5. Sucursales / Nodos
  const [sucursales, setSucursales] = useState<Sucursal[]>(defaultSucursales);
  const [showAddSucursal, setShowAddSucursal] = useState<boolean>(false);
  const [newSucNombre, setNewSucNombre] = useState<string>('');
  const [newSucCiudad, setNewSucCiudad] = useState<string>('');
  const [newSucDireccion, setNewSucDireccion] = useState<string>('');

  // 6. Apariencia Zen & Personalización
  const [accentColor, setAccentColor] = useState<string>('#dc143c');
  const [blurIntensity, setBlurIntensity] = useState<string>('16px');
  const [customGreeting, setCustomGreeting] = useState<string>(
    'Hola Zairen Lab, me interesa consultar sobre una prenda del catálogo:'
  );

  // 7. Banner Promocional, Horarios & Modo Mantenimiento
  const [bannerEnabled, setBannerEnabled] = useState<boolean>(false);
  const [bannerText, setBannerText] = useState<string>('NUEVO DROP 2026 // ENVÍOS A TODA BOLIVIA');
  const [bannerLink, setBannerLink] = useState<string>('#catalogo');
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('Tienda en actualización de catálogo. Volvemos en breve.');
  const [openingHours, setOpeningHours] = useState<string>('Lun a Sáb: 09:00 - 20:00 (BOT)');

  // Helper para crear snapshot de estado y comparar suciedad
  const getSnapshot = () =>
    JSON.stringify({
      currency,
      exchangeRate,
      shippingCost,
      freeShippingEnabled,
      freeShippingThreshold,
      deliveryTime,
      brandName,
      brandSlogan,
      channels,
      sucursales,
      accentColor,
      blurIntensity,
      customGreeting,
      bannerEnabled,
      bannerText,
      bannerLink,
      maintenanceMode,
      maintenanceMessage,
      openingHours,
    });

  // Marcar sucio cuando cambie cualquier valor tras la carga inicial
  useEffect(() => {
    if (!initialSnapshotRef.current) return;
    const current = getSnapshot();
    setIsDirty(current !== initialSnapshotRef.current);
  }, [
    currency,
    exchangeRate,
    shippingCost,
    freeShippingEnabled,
    freeShippingThreshold,
    deliveryTime,
    brandName,
    brandSlogan,
    channels,
    sucursales,
    accentColor,
    blurIntensity,
    customGreeting,
    bannerEnabled,
    bannerText,
    bannerLink,
    maintenanceMode,
    maintenanceMessage,
    openingHours,
  ]);

  // Alerta de beforeunload al intentar salir con cambios sin guardar
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Cargar configuraciones guardadas al iniciar desde Supabase (y localStorage de fallback)
  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      let dbData: any = null;
      try {
        const { data } = await supabase
          .from('configuracion')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        dbData = data;
        if (data && isMounted) {
          // Marca
          if (data.marca) setBrandName(data.marca);
          if (data.slogan) setBrandSlogan(data.slogan);

          // Canales ordenados prioritarios
          if (Array.isArray(data.canales_ordenados) && data.canales_ordenados.length > 0) {
            setChannels(data.canales_ordenados);
          } else {
            // Reconstruir canales desde campos legados si existen
            const legacyChannels: ContactChannel[] = [...DEFAULT_CONTACT_CHANNELS];
            if (data.whatsapp_numero) {
              const wa = legacyChannels.find((c) => c.id === 'whatsapp');
              if (wa) {
                wa.value = data.whatsapp_numero;
                if (data.whatsapp_mensaje_template) wa.messageTemplate = data.whatsapp_mensaje_template;
              }
            }
            if (Array.isArray(data.redes_sociales)) {
              data.redes_sociales.forEach((r: any) => {
                const match = legacyChannels.find((c) => c.id === r.id);
                if (match) {
                  match.value = r.url || match.value;
                  match.enabled = Boolean(r.activo);
                }
              });
            }
            setChannels(legacyChannels);
          }

          // Políticas de envío
          if (data.politicas_envio) {
            if (typeof data.politicas_envio.costo_envio_express === 'number') {
              setShippingCost(data.politicas_envio.costo_envio_express);
            }
            if (typeof data.politicas_envio.envio_gratis_minimo === 'number') {
              setFreeShippingThreshold(data.politicas_envio.envio_gratis_minimo);
            }
            if (typeof (data.politicas_envio as any).envio_gratis_habilitado === 'boolean') {
              setFreeShippingEnabled((data.politicas_envio as any).envio_gratis_habilitado);
            }
            if ((data.politicas_envio as any).tiempo_entrega) {
              setDeliveryTime((data.politicas_envio as any).tiempo_entrega);
            }
          }

          // Moneda & Apariencia
          if (data.apariencia) {
            if (data.apariencia.color_acento) setAccentColor(data.apariencia.color_acento);
            if (data.apariencia.blur_intensidad) setBlurIntensity(data.apariencia.blur_intensidad);
            if (data.apariencia.saludo_personalizado) setCustomGreeting(data.apariencia.saludo_personalizado);
            if (data.apariencia.moneda_activa) setCurrency(data.apariencia.moneda_activa);
            if (data.apariencia.tasa_cambio) setExchangeRate(data.apariencia.tasa_cambio);
          }

          // Banner Promocional, Horarios & Modo Mantenimiento
          if (data.banner_promocional) {
            if (typeof data.banner_promocional.activo === 'boolean') setBannerEnabled(data.banner_promocional.activo);
            if (data.banner_promocional.texto) setBannerText(data.banner_promocional.texto);
            if (data.banner_promocional.link) setBannerLink(data.banner_promocional.link);
          }
          if (data.modo_mantenimiento) {
            if (typeof data.modo_mantenimiento.activo === 'boolean') setMaintenanceMode(data.modo_mantenimiento.activo);
            if (data.modo_mantenimiento.mensaje) setMaintenanceMessage(data.modo_mantenimiento.mensaje);
          }
          if (data.horario_atencion) {
            setOpeningHours(data.horario_atencion);
          }
        }
      } catch (err) {
        console.warn('Error cargando configuracion desde Supabase:', err);
      }

      // Sincronizar fallback local si es necesario
      if (typeof window !== 'undefined' && isMounted) {
        const curConfig = getCurrencyConfig();
        if (!currency) setCurrency(curConfig.currency);
        if (!exchangeRate) setExchangeRate(curConfig.rate);

        const savedSuc = localStorage.getItem('zairen_sucursales');
        if (savedSuc) {
          try {
            const parsed = JSON.parse(savedSuc);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSucursales(parsed);
            }
          } catch (e) {}
        }

        const savedChannels = localStorage.getItem('zairen_contact_channels');
        if (savedChannels && (!dbData || !dbData.canales_ordenados)) {
          try {
            const parsed = JSON.parse(savedChannels);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setChannels(parsed);
            }
          } catch (e) {}
        }
      }

      // Registrar instantánea inicial
      setTimeout(() => {
        initialSnapshotRef.current = getSnapshot();
        setIsDirty(false);
      }, 100);
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers para reordenar y modificar canales de contacto
  const moveChannel = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= channels.length) return;

    const newChannels = [...channels];
    const temp = newChannels[index];
    newChannels[index] = newChannels[targetIndex];
    newChannels[targetIndex] = temp;

    // Actualizar propiedad order
    const updated = newChannels.map((c, i) => ({ ...c, order: i }));
    setChannels(updated);
  };

  const toggleChannel = (id: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const updateChannelValue = (id: string, value: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value } : c))
    );
  };

  const updateChannelMessage = (id: string, messageTemplate: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, messageTemplate } : c))
    );
  };

  const handleAddCustomChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim() || !newChannelValue.trim()) {
      toast.error('Completa el nombre y valor del canal');
      return;
    }

    const newChan: ContactChannel = {
      id: `custom-${Date.now()}`,
      name: newChannelName.trim(),
      type: newChannelType,
      value: newChannelValue.trim(),
      enabled: true,
      order: channels.length,
      messageTemplate:
        newChannelType === 'whatsapp'
          ? 'Hola Zairen Lab, me interesa consultar sobre *{prenda}* ({moneda} {precio}):\n{url}'
          : undefined,
    };

    setChannels((prev) => [...prev, newChan]);
    setNewChannelName('');
    setNewChannelValue('');
    setShowAddChannel(false);
    toast.success('Canal de contacto añadido');
  };

  const handleRemoveChannel = (id: string) => {
    setChannels((prev) =>
      prev
        .filter((c) => c.id !== id)
        .map((c, idx) => ({ ...c, order: idx }))
    );
    toast.info('Canal eliminado');
  };

  // Descartar cambios
  const handleDiscardChanges = () => {
    if (!initialSnapshotRef.current) return;
    try {
      const parsed = JSON.parse(initialSnapshotRef.current);
      setCurrency(parsed.currency);
      setExchangeRate(parsed.exchangeRate);
      setShippingCost(parsed.shippingCost);
      setFreeShippingEnabled(parsed.freeShippingEnabled);
      setFreeShippingThreshold(parsed.freeShippingThreshold);
      setDeliveryTime(parsed.deliveryTime);
      setBrandName(parsed.brandName);
      setBrandSlogan(parsed.brandSlogan);
      setChannels(parsed.channels);
      setSucursales(parsed.sucursales);
      setAccentColor(parsed.accentColor);
      setBlurIntensity(parsed.blurIntensity);
      setCustomGreeting(parsed.customGreeting);
      setBannerEnabled(parsed.bannerEnabled);
      setBannerText(parsed.bannerText);
      setBannerLink(parsed.bannerLink);
      setMaintenanceMode(parsed.maintenanceMode);
      setMaintenanceMessage(parsed.maintenanceMessage);
      setOpeningHours(parsed.openingHours);
      setIsDirty(false);
      toast.info('Cambios descartados');
    } catch {
      toast.error('No se pudo restaurar la configuración');
    }
  };

  // Guardar configuración completa y revalidar caché
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const loadingToast = toast.loading('Guardando configuración y revalidando catálogo...');

    try {
      // 1. Extraer datos del canal prioritario WhatsApp para retrocompatibilidad
      const waChannel = channels.find((c) => c.type === 'whatsapp' && c.enabled) || channels.find((c) => c.type === 'whatsapp');
      const waNumber = waChannel ? waChannel.value.replace(/\D/g, '') : siteConfig.whatsapp.number;
      const waTemplate = waChannel?.messageTemplate || siteConfig.whatsapp.messageTemplate;

      const payload = {
        marca: brandName,
        slogan: brandSlogan,
        whatsapp_numero: waNumber,
        whatsapp_mensaje_template: waTemplate,
        moneda_codigo: currency,
        moneda_simbolo: currency === 'BOB' ? 'Bs' : '$',
        canales_ordenados: channels,
        canales_contacto: {
          whatsapp: { activo: Boolean(waChannel?.enabled), telefono: waNumber },
          canales: channels,
        },
        redes_sociales: channels
          .filter((c) => c.type !== 'whatsapp')
          .map((c) => ({
            id: c.id,
            nombre: c.name,
            url: c.value,
            activo: c.enabled,
          })),
        politicas_envio: {
          envio_gratis_minimo: freeShippingThreshold,
          costo_envio_express: shippingCost,
          envio_gratis_habilitado: freeShippingEnabled,
          tiempo_entrega: deliveryTime,
          ciudades_cobertura: ['La Paz', 'Cochabamba', 'Santa Cruz', 'Sucre', 'Oruro', 'Potosí', 'Beni', 'Pando'],
        },
        apariencia: {
          color_acento: accentColor,
          blur_intensidad: blurIntensity,
          saludo_personalizado: customGreeting,
          tasa_cambio: exchangeRate > 0 ? exchangeRate : 6.96,
          moneda_activa: currency,
        },
        banner_promocional: {
          activo: bannerEnabled,
          texto: bannerText,
          link: bannerLink,
        },
        modo_mantenimiento: {
          activo: maintenanceMode,
          mensaje: maintenanceMessage,
        },
        horario_atencion: openingHours,
        updated_at: new Date().toISOString(),
      };

      // Guardar en Supabase tabla configuracion (fila única id=1)
      const { error } = await supabase
        .from('configuracion')
        .upsert({ id: 1, ...payload });

      if (error) {
        throw error;
      }

      // 2. Limpiar cache de memoria
      clearStoreConfigCache();

      // 3. Guardar en localStorage para reactividad client-side inmediata
      if (typeof window !== 'undefined') {
        setCurrencyConfig({ currency, rate: exchangeRate > 0 ? exchangeRate : 6.96 });
        localStorage.setItem('zairen_cart_promo_enabled', String(freeShippingEnabled));
        localStorage.setItem('zairen_shipping_cost', String(shippingCost));
        localStorage.setItem('zairen_shipping_threshold', String(freeShippingThreshold));
        localStorage.setItem('zairen_sucursales', JSON.stringify(sucursales));
        localStorage.setItem('zairen_contact_channels', JSON.stringify(channels));
        localStorage.setItem('zairen_accent_color', accentColor);
        localStorage.setItem('zairen_blur_intensity', blurIntensity);
        localStorage.setItem('zairen_custom_greeting', customGreeting);
        localStorage.setItem('zairen_banner_enabled', String(bannerEnabled));
        localStorage.setItem('zairen_banner_text', bannerText);
        localStorage.setItem('zairen_banner_link', bannerLink);
        localStorage.setItem('zairen_maintenance_mode', String(maintenanceMode));
        localStorage.setItem('zairen_maintenance_message', maintenanceMessage);
        localStorage.setItem('zairen_opening_hours', openingHours);
        document.documentElement.style.setProperty('--color-brand-crimson', accentColor);
        document.documentElement.style.setProperty('--color-primary-container', accentColor);
        window.dispatchEvent(new Event('zairen-config-updated'));
      }

      // 4. Disparar revalidación segura del catálogo Edge (Fase 3)
      try {
        await fetch('/api/admin/revalidar-catalogo', { method: 'POST' });
      } catch (err) {
        console.warn('Revalidación edge no disponible:', err);
      }

      initialSnapshotRef.current = getSnapshot();
      setIsDirty(false);

      toast.dismiss(loadingToast);
      toast.success('Configuración guardada y catálogo actualizado', {
        description: `Canales activos: ${getActiveChannels(channels).length} • Revalidación Edge completada`,
      });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error('Error al guardar en Supabase: ' + (err?.message || 'Verifica permisos'));
    }
  };

  const activeChannels = getActiveChannels(channels);
  const priorityChannel = getFirstActiveChannel(channels);

  // Mock product info para previsualización
  const mockProduct = {
    nombre: 'POLERA OVERSIZED BOX-01 SUMI',
    precio: currency === 'USD' ? 26 : 180,
    moneda: currency === 'USD' ? '$' : 'Bs',
    url: 'https://zairenlab.pages.dev/producto/box-01-sumi',
  };

  return (
    <div className="flex flex-col gap-8 relative pb-28">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#dc143c] animate-pulse"></span>
            <span className="font-mono text-xs text-[#dc143c] uppercase tracking-wider font-bold">
              CMS // AJUSTES DE MARCA, CANALES Y ENVÍOS
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight">
            CONFIGURACIÓN WEB <span className="text-[#dc143c] text-xl font-mono font-normal">// STORE ENGINE</span>
          </h1>
          <div className="h-0.5 w-72 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent mt-2"></div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-6 py-2.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_20px_rgba(220,20,60,0.35)] transition-all cursor-pointer border border-[#dc143c]"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Guardar Configuración</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        
        {/* ======================================================== */}
        {/* SECCIÓN 1: SISTEMA DE MONEDA UNIFICADA (BOB vs USD)      */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">currency_exchange</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                Sistema de Moneda de la Tienda (BOB / USD)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-none bg-[#1c1b1b] text-[#ffb3b3] font-mono text-[10px] uppercase font-bold border border-[#201f1f]">
              ACTIVO: {currency}
            </span>
          </div>

          <p className="text-xs text-[#ac8888] font-sans">
            Elige en qué moneda deseas mostrar todos los productos del catálogo y checkout.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-[#1c1b1b] border border-[#201f1f]">
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-2">
                Moneda Activa en Pantalla
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCurrency('BOB')}
                  className={`py-2 px-3 text-xs font-mono uppercase font-bold transition-all border cursor-pointer ${
                    currency === 'BOB'
                      ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.4)]'
                      : 'bg-[#141416] text-[#ac8888] hover:text-white border-[#201f1f]'
                  }`}
                >
                  🇧🇴 Bolivianos (Bs)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`py-2 px-3 text-xs font-mono uppercase font-bold transition-all border cursor-pointer ${
                    currency === 'USD'
                      ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_0_12px_rgba(220,20,60,0.4)]'
                      : 'bg-[#141416] text-[#ac8888] hover:text-white border-[#201f1f]'
                  }`}
                >
                  🇺🇸 Dólares ($ USD)
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#1c1b1b] border border-[#201f1f]">
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Tasa de Cambio Manual (1 USD = X BOB)
              </label>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-white font-bold">$ 1.00 USD =</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 6.96)}
                  className="flex-1 px-3 py-1.5 bg-[#141416] text-[#FAF9F6] font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                />
                <span className="font-mono text-xs text-[#ac8888]">BOB</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 2: POLÍTICAS DE ENVÍO & TOGGLE ENVÍO GRATIS       */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">local_shipping</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                Políticas de Envío & Tarifas
              </h3>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-none font-mono text-[10px] uppercase font-bold border ${
                freeShippingEnabled
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-[#1c1b1b] text-[#ac8888] border-[#201f1f]'
              }`}
            >
              ENVÍO GRATIS: {freeShippingEnabled ? 'ACTIVADO' : 'DESACTIVADO'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#1c1b1b] border border-[#201f1f]">
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Costo Envío Express ({currency === 'BOB' ? 'Bs' : '$'})
              </label>
              <input
                type="number"
                min="0"
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
              />
            </div>

            <div className="p-4 bg-[#1c1b1b] border border-[#201f1f]">
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-xs text-[#ac8888] uppercase">
                  Monto Mínimo Envío Gratis
                </label>
                <input
                  type="checkbox"
                  checked={freeShippingEnabled}
                  onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded-none accent-[#dc143c] cursor-pointer"
                />
              </div>
              <input
                type="number"
                min="0"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(Number(e.target.value) || 0)}
                disabled={!freeShippingEnabled}
                className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none disabled:opacity-40"
              />
            </div>

            <div className="p-4 bg-[#1c1b1b] border border-[#201f1f]">
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Tiempo de Entrega Estimado
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="24 a 48 hrs"
                className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 3: CANALES DE CONTACTO DINÁMICOS & PRIORIDAD       */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#dc143c] text-[20px]">contacts</span>
                <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                  Canales de Contacto Oficial & Prioridad de Atención
                </h3>
              </div>
              <p className="text-xs text-[#ac8888] font-sans mt-0.5">
                Configura los canales oficiales. El primer canal activo se muestra en la tarjeta del catálogo; todos los activos aparecen en la ficha de producto.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-[#1c1b1b] text-emerald-400 font-mono text-[10px] uppercase font-bold border border-[#201f1f]">
                {activeChannels.length} ACTIVOS
              </span>
              <button
                type="button"
                onClick={() => setShowAddChannel(!showAddChannel)}
                className="px-3 py-1 bg-[#201f1f] hover:bg-[#2a2a2a] text-white font-mono text-[11px] uppercase tracking-wider flex items-center gap-1 border border-white/[0.08] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                <span>Nuevo Canal</span>
              </button>
            </div>
          </div>

          {/* Formulario para añadir canal nuevo */}
          {showAddChannel && (
            <div className="p-4 bg-[#1c1b1b] border border-[#dc143c]/30 space-y-3">
              <div className="font-headline text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>Registrar Nuevo Canal de Contacto</span>
                <button
                  type="button"
                  onClick={() => setShowAddChannel(false)}
                  className="text-[#ac8888] hover:text-white font-mono text-xs"
                >
                  ✕ Cerrar
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-mono text-[10px] text-[#ac8888] uppercase block mb-1">
                    Tipo de Canal
                  </label>
                  <select
                    value={newChannelType}
                    onChange={(e) => setNewChannelType(e.target.value as ChannelType)}
                    className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f]"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="custom">Canal Web / Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#ac8888] uppercase block mb-1">
                    Etiqueta Visible
                  </label>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Ej: Telegram, Soporte WhatsApp"
                    className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f]"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#ac8888] uppercase block mb-1">
                    Número, Usuario o Enlace
                  </label>
                  <input
                    type="text"
                    value={newChannelValue}
                    onChange={(e) => setNewChannelValue(e.target.value)}
                    placeholder="591... o @usuario o https://"
                    className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f]"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddCustomChannel}
                  className="px-4 py-1.5 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase font-bold"
                >
                  Guardar Canal
                </button>
              </div>
            </div>
          )}

          {/* Lista de canales ordenables */}
          <div className="space-y-3">
            {channels.map((channel, idx) => {
              // Validaciones en vivo
              const isWa = channel.type === 'whatsapp';
              const phoneVal = isWa ? validatePhone(channel.value) : { valid: true, error: undefined };
              const socialVal = !isWa ? validateSocialHandleOrUrl(channel.type, channel.value) : { valid: true, error: undefined };
              const hasError = !phoneVal.valid || !socialVal.valid;

              return (
                <div
                  key={channel.id}
                  className={`p-4 border transition-all rounded-none ${
                    channel.enabled
                      ? idx === 0
                        ? 'bg-[#1c1b1b] border-[#dc143c] shadow-[0_0_15px_rgba(220,20,60,0.15)]'
                        : 'bg-[#1c1b1b] border-white/[0.08]'
                      : 'bg-[#18181a] border-white/[0.03] opacity-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
                    <div className="flex items-center gap-2">
                      {/* Controles de Orden / Prioridad */}
                      <div className="flex items-center gap-1 bg-[#141416] p-0.5 border border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => moveChannel(idx, 'up')}
                          disabled={idx === 0}
                          title="Subir prioridad"
                          className="w-6 h-6 flex items-center justify-center text-[#ac8888] hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveChannel(idx, 'down')}
                          disabled={idx === channels.length - 1}
                          title="Bajar prioridad"
                          className="w-6 h-6 flex items-center justify-center text-[#ac8888] hover:text-white disabled:opacity-20 cursor-pointer"
                        >
                          ▼
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white px-2 py-0.5 bg-[#201f1f]">
                          #{idx + 1}
                        </span>
                        <span className="font-headline text-xs font-bold text-[#FAF9F6] uppercase">
                          {channel.name}
                        </span>
                        {idx === 0 && channel.enabled && (
                          <span className="px-2 py-0.5 bg-[#dc143c]/15 text-[#dc143c] border border-[#dc143c]/40 font-mono text-[9px] uppercase font-bold tracking-wider">
                            PRIORITARIO EN TARJETA
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <span className="font-mono text-[10px] text-[#ac8888] uppercase">
                          {channel.enabled ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                        <input
                          type="checkbox"
                          checked={channel.enabled}
                          onChange={() => toggleChannel(channel.id)}
                          className="w-4 h-4 rounded-none accent-[#dc143c] cursor-pointer"
                        />
                      </label>

                      {channel.id.startsWith('custom-') && (
                        <button
                          type="button"
                          onClick={() => handleRemoveChannel(channel.id)}
                          className="text-[#ac8888] hover:text-red-400 font-mono text-xs"
                          title="Eliminar canal"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                    <div>
                      <label className="font-mono text-[10px] text-[#ac8888] uppercase block mb-1">
                        {isWa ? 'Número de WhatsApp (con código de país sin +)' : 'Usuario o Enlace Completo'}
                      </label>
                      <input
                        type="text"
                        value={channel.value}
                        onChange={(e) => updateChannelValue(channel.id, e.target.value)}
                        placeholder={isWa ? '59170000000' : 'https://... o @usuario'}
                        className={`w-full px-3 py-1.5 bg-[#141416] font-mono text-xs text-white rounded-none border focus:outline-none ${
                          hasError ? 'border-red-500' : 'border-[#201f1f] focus:border-[#dc143c]'
                        }`}
                      />
                      {hasError && (
                        <span className="font-mono text-[10px] text-red-400 block mt-1">
                          ⚠️ {phoneVal.error || socialVal.error}
                        </span>
                      )}
                    </div>

                    {isWa && (
                      <div>
                        <label className="font-mono text-[10px] text-[#ac8888] uppercase block mb-1">
                          Plantilla Mensaje para Ficha de Producto
                        </label>
                        <textarea
                          rows={2}
                          value={channel.messageTemplate || ''}
                          onChange={(e) => updateChannelMessage(channel.id, e.target.value)}
                          placeholder="Hola Zairen Lab, me interesa {prenda}..."
                          className="w-full px-3 py-1 bg-[#141416] font-mono text-[11px] text-[#FAF9F6] rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                        />
                        <span className="font-mono text-[9px] text-[#ac8888] block mt-0.5">
                          Variables: <code>{'{prenda}'}</code>, <code>{'{precio}'}</code>, <code>{'{moneda}'}</code>, <code>{'{url}'}</code>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* VISTA PREVIA EN VIVO (CARD VS DETALLE)                    */}
          {/* ======================================================== */}
          <div className="mt-6 p-5 bg-[#0e0e10] border border-[#201f1f] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#dc143c] text-[18px]">visibility</span>
                <span className="font-headline text-xs font-bold text-white uppercase tracking-wider">
                  Previsualización en Vivo de Canales de Contacto
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#141416] p-0.5 border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setPreviewTab('card')}
                  className={`px-3 py-1 font-mono text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                    previewTab === 'card'
                      ? 'bg-[#dc143c] text-white'
                      : 'text-[#ac8888] hover:text-white'
                  }`}
                >
                  Tarjeta del Catálogo (1 Canal)
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('detail')}
                  className={`px-3 py-1 font-mono text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                    previewTab === 'detail'
                      ? 'bg-[#dc143c] text-white'
                      : 'text-[#ac8888] hover:text-white'
                  }`}
                >
                  Ficha de Producto (Todos)
                </button>
              </div>
            </div>

            {previewTab === 'card' ? (
              <div className="max-w-xs mx-auto p-4 bg-[#141416] border border-[#201f1f] space-y-3">
                <div className="aspect-square bg-[#1c1b1b] flex items-center justify-center text-xs font-mono text-[#888] relative">
                  <span>PRENDA MOCKUP</span>
                  {/* Badge o botón de contacto prioritario */}
                  {priorityChannel ? (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/80 backdrop-blur border border-white/[0.1] text-white font-mono text-[10px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>{priorityChannel.name}</span>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/50 text-[9px] font-mono text-[#888]">
                      Sin canales activos
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-[#ac8888] block">ZAIREN LAB</span>
                  <span className="font-display text-xs font-bold text-white block uppercase">
                    {mockProduct.nombre}
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono text-sm font-bold text-white">
                      {mockProduct.moneda} {mockProduct.precio.toFixed(2)}
                    </span>
                    {priorityChannel ? (
                      <a
                        href={buildChannelActionUrl(priorityChannel, mockProduct)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-[#201f1f] hover:bg-[#dc143c] text-white font-mono text-[10px] uppercase tracking-wider flex items-center gap-1 border border-white/[0.1] transition-colors"
                      >
                        <span>Consultar</span>
                        <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                      </a>
                    ) : (
                      <span className="font-mono text-[9px] text-[#ac8888]">Canal oculto</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-lg mx-auto p-5 bg-[#141416] border border-[#201f1f] space-y-4">
                <div className="border-b border-white/[0.06] pb-2">
                  <span className="text-[10px] font-mono text-[#dc143c] uppercase font-bold tracking-wider">
                    ATENCIÓN DIRECTA // DISPONIBILIDAD
                  </span>
                  <h4 className="font-headline text-sm font-bold text-white uppercase">
                    Consulta con la tienda oficial
                  </h4>
                </div>

                {activeChannels.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeChannels.map((c) => (
                      <a
                        key={c.id}
                        href={buildChannelActionUrl(c, mockProduct)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-[#1c1b1b] hover:bg-[#201f1f] border border-white/[0.08] hover:border-[#dc143c] transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="font-mono text-xs text-white uppercase font-bold group-hover:text-[#dc143c]">
                            {c.name}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[14px] text-[#ac8888] group-hover:text-white">
                          arrow_outward
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-[#1c1b1b]/50 border border-white/[0.04] text-center font-mono text-xs text-[#ac8888]">
                    No hay canales de contacto activos configurados actualmente. Este bloque se ocultará por completo en la tienda.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 4: GESTIÓN DE SUCURSALES / NODOS                  */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">store</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                Nodos y Puntos de Entrega
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-none bg-[#1c1b1b] text-[#ffb3b3] font-mono text-[10px] uppercase font-bold border border-[#201f1f]">
              {sucursales.length} NODOS
            </span>
          </div>

          <div className="space-y-2">
            {sucursales.map((suc) => (
              <div key={suc.id} className="p-3 bg-[#1c1b1b] border border-[#201f1f] flex items-center justify-between">
                <div>
                  <span className="font-headline text-xs font-bold text-white uppercase block">{suc.nombre}</span>
                  <span className="font-mono text-[11px] text-[#ac8888]">{suc.ciudad} • {suc.direccion}</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 uppercase font-bold">Activo</span>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 5: APARIENCIA ZEN & AVISOS                        */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">palette</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                Apariencia Zen & Avisos en Cabecera
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#1c1b1b] border border-[#201f1f]">
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Color de Acento Carmesí
              </label>
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f]"
              />
            </div>
            <div className="p-4 bg-[#1c1b1b] border border-[#201f1f]">
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Horario de Atención Oficial
              </label>
              <input
                type="text"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f]"
              />
            </div>
          </div>
        </div>
      </form>

      {/* ======================================================== */}
      {/* BARRA FLOTANTE INFERIOR AL DETECTAR CAMBIOS PENDIENTES   */}
      {/* ======================================================== */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141416]/95 backdrop-blur-xl border-t-2 border-[#dc143c] shadow-[0_-8px_30px_rgba(0,0,0,0.8)] px-4 py-3.5 transition-all animate-in slide-in-from-bottom duration-300">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
              <span className="font-headline text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                Tienes cambios sin guardar en la configuración
              </span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="flex-1 sm:flex-initial px-4 py-2 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#ac8888] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors border border-white/[0.08] cursor-pointer"
              >
                Descartar
              </button>
              <button
                type="button"
                onClick={handleSaveAll}
                className="flex-1 sm:flex-initial px-5 py-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(220,20,60,0.4)] transition-all cursor-pointer border border-[#dc143c]"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Guardar y Publicar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
