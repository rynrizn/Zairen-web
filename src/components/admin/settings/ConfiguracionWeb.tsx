import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { clearStoreConfigCache } from '../../../lib/configuracion';
import {
  siteConfig,
  getCurrencyConfig,
  setCurrencyConfig,
  type CurrencyConfig,
  type SocialNetwork,
} from '../../../config/site';

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

  // 3. Marca & WhatsApp
  const [brandName, setBrandName] = useState(siteConfig.name);
  const [brandSlogan, setBrandSlogan] = useState(siteConfig.slogan);
  const [whatsappNumber, setWhatsappNumber] = useState(siteConfig.whatsapp.number);
  const [whatsappDisplay, setWhatsappDisplay] = useState(siteConfig.whatsapp.displayNumber);
  const [whatsappTemplate, setWhatsappTemplate] = useState(siteConfig.whatsapp.messageTemplate);

  // 4. Sucursales / Nodos
  const [sucursales, setSucursales] = useState<Sucursal[]>(defaultSucursales);
  const [showAddSucursal, setShowAddSucursal] = useState<boolean>(false);
  const [newSucNombre, setNewSucNombre] = useState<string>('');
  const [newSucCiudad, setNewSucCiudad] = useState<string>('');
  const [newSucDireccion, setNewSucDireccion] = useState<string>('');

  // 5. Redes Sociales Dinámicas
  const [socials, setSocials] = useState<SocialNetwork[]>([
    {
      id: 'tiktok',
      name: 'TikTok',
      url: 'https://tiktok.com/@zairenlab',
      enabled: true,
      icon: 'Video',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/zairenlab',
      enabled: true,
      icon: 'Instagram',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      url: `https://wa.me/${siteConfig.whatsapp.number}`,
      enabled: true,
      icon: 'MessageSquare',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      url: 'https://x.com/zairenlab',
      enabled: true,
      icon: 'Twitter',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: '',
      enabled: false,
      icon: 'Facebook',
    },
  ]);

  // 6. Apariencia Zen & Personalización (Estilo CatalogoV0)
  const [accentColor, setAccentColor] = useState<string>('#dc143c');
  const [blurIntensity, setBlurIntensity] = useState<string>('16px');
  const [customGreeting, setCustomGreeting] = useState<string>(
    'Hola Zairen Lab, me interesa consultar sobre una prenda del catálogo:'
  );

  // Cargar configuraciones guardadas al iniciar desde Supabase (y localStorage de fallback)
  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      try {
        const { data, error } = await supabase
          .from('configuracion')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (data && isMounted) {
          // Marca & WhatsApp
          if (data.marca) setBrandName(data.marca);
          if (data.slogan) setBrandSlogan(data.slogan);
          if (data.whatsapp_numero) setWhatsappNumber(data.whatsapp_numero);
          if (data.whatsapp_mensaje_template) setWhatsappTemplate(data.whatsapp_mensaje_template);

          // Canales de contacto / display
          if (data.canales_contacto?.whatsapp?.telefono) {
            setWhatsappDisplay(data.canales_contacto.whatsapp.telefono);
          }

          // Redes sociales
          if (Array.isArray(data.redes_sociales) && data.redes_sociales.length > 0) {
            setSocials(
              data.redes_sociales.map((r: any) => ({
                id: r.id,
                name: r.nombre || r.id,
                url: r.url || '',
                enabled: Boolean(r.activo),
                icon: r.id === 'tiktok' ? 'Video' : r.id === 'instagram' ? 'Instagram' : r.id === 'twitter' ? 'Twitter' : r.id === 'facebook' ? 'Facebook' : 'MessageSquare',
              }))
            );
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
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleSocial = (id: string) => {
    setSocials((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleUpdateSocialUrl = (id: string, url: string) => {
    setSocials((prev) =>
      prev.map((s) => (s.id === id ? { ...s, url } : s))
    );
  };

  const handleAddSucursal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSucNombre.trim() || !newSucCiudad.trim()) {
      toast.error('Nombre y ciudad de la sucursal son requeridos');
      return;
    }
    const nueva: Sucursal = {
      id: `suc-${Date.now()}`,
      nombre: newSucNombre.trim(),
      ciudad: newSucCiudad.trim(),
      direccion: newSucDireccion.trim() || 'Dirección por coordinar',
      activa: true,
    };
    const updated = [...sucursales, nueva];
    setSucursales(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zairen_sucursales', JSON.stringify(updated));
    }
    setNewSucNombre('');
    setNewSucCiudad('');
    setNewSucDireccion('');
    setShowAddSucursal(false);
    toast.success(`Sucursal ${nueva.nombre} añadida con éxito`);
  };

  const handleToggleSucursal = (id: string) => {
    const updated = sucursales.map((s) =>
      s.id === id ? { ...s, activa: !s.activa } : s
    );
    setSucursales(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zairen_sucursales', JSON.stringify(updated));
    }
  };

  const handleDeleteSucursal = (id: string) => {
    if (sucursales.length <= 1) {
      toast.error('Debe mantenerse al menos una sucursal registrada');
      return;
    }
    const updated = sucursales.filter((s) => s.id !== id);
    setSucursales(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zairen_sucursales', JSON.stringify(updated));
    }
    toast.info('Sucursal eliminada');
  };

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const loadingToast = toast.loading('Guardando configuración en la base de datos...');

    try {
      // Formatear payload para la tabla public.configuracion en Supabase
      const payload = {
        marca: brandName,
        slogan: brandSlogan,
        whatsapp_numero: whatsappNumber,
        whatsapp_mensaje_template: whatsappTemplate,
        moneda_codigo: currency,
        moneda_simbolo: currency === 'BOB' ? 'Bs' : '$',
        canales_contacto: {
          whatsapp: { activo: true, telefono: whatsappDisplay },
          instagram_dm: { activo: true, usuario: '@zairenlab' },
        },
        redes_sociales: socials.map((s) => ({
          id: s.id,
          nombre: s.name,
          url: s.url,
          activo: s.enabled,
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
        updated_at: new Date().toISOString(),
      };

      // Guardar en Supabase tabla configuracion (fila única id=1)
      const { error } = await supabase
        .from('configuracion')
        .upsert({ id: 1, ...payload });

      if (error) {
        throw error;
      }

      // Limpiar cache de memoria
      clearStoreConfigCache();

      // Guardar también en localStorage para reactividad client-side inmediata
      if (typeof window !== 'undefined') {
        setCurrencyConfig({ currency, rate: exchangeRate > 0 ? exchangeRate : 6.96 });
        localStorage.setItem('zairen_cart_promo_enabled', String(freeShippingEnabled));
        localStorage.setItem('zairen_shipping_cost', String(shippingCost));
        localStorage.setItem('zairen_shipping_threshold', String(freeShippingThreshold));
        localStorage.setItem('zairen_sucursales', JSON.stringify(sucursales));
        localStorage.setItem('zairen_accent_color', accentColor);
        localStorage.setItem('zairen_blur_intensity', blurIntensity);
        localStorage.setItem('zairen_custom_greeting', customGreeting);
        localStorage.setItem('zairen_socials', JSON.stringify(socials));
        document.documentElement.style.setProperty('--color-brand-crimson', accentColor);
        document.documentElement.style.setProperty('--color-primary-container', accentColor);
        window.dispatchEvent(new Event('zairen-config-updated'));
      }

      toast.dismiss(loadingToast);
      toast.success('Configuración guardada en la base de datos', {
        description: `Moneda: ${currency} // Redes activas: ${socials.filter(s => s.enabled).length} // Envíos guardados`,
      });
    } catch (err: any) {
      toast.dismiss(loadingToast);
      toast.error('Error al guardar en Supabase: ' + (err?.message || 'Verifica permisos'));
    }
  };

  const activeSocialsCount = socials.filter((s) => s.enabled && s.url.trim() !== '').length;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-[#dc143c] animate-pulse"></span>
            <span className="font-mono text-xs text-[#dc143c] uppercase tracking-wider font-bold">
              CMS // AJUSTES DE MARCA, MONEDA Y ENVÍOS
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
            Elige en qué moneda deseas mostrar todos los productos del catálogo y checkout. Puedes alternar entre Bolivianos (Bs) y Dólares (USD) definiendo manualmente el tipo de cambio oficial.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Selector de Moneda */}
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

            {/* Tasa de Cambio Manual */}
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
              <span className="text-[10px] font-mono text-[#ac8888] block mt-1.5">
                {currency === 'USD'
                  ? `Prenda de Bs 180 se mostrará como $ ${(180 / (exchangeRate || 6.96)).toFixed(2)} USD`
                  : 'Prenda de Bs 180 se mostrará como Bs 180'}
              </span>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Precio de Envío Estándar (Bs)
              </label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2 bg-[#1c1b1b] text-white font-mono text-sm rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
              />
              <span className="text-[10px] font-mono text-[#ac8888] block mt-1">
                Tarifa cobrada en la bolsa de compras.
              </span>
            </div>

            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Monto Mínimo para Envío Gratis (Bs)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                disabled={!freeShippingEnabled}
                className={`w-full px-3.5 py-2 bg-[#1c1b1b] text-white font-mono text-sm rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none ${
                  !freeShippingEnabled ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              />
              <span className="text-[10px] font-mono text-[#ac8888] block mt-1">
                Sólo aplicable si activas la opción abajo.
              </span>
            </div>

            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Tiempo de Entrega Estimado
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
              />
              <span className="text-[10px] font-mono text-[#ac8888] block mt-1">
                Ej: Coordinación directa por WhatsApp.
              </span>
            </div>
          </div>

          {/* Toggle de Envío Gratis */}
          <div className="pt-3 border-t border-white/[0.06]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={freeShippingEnabled}
                onChange={(e) => setFreeShippingEnabled(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded-none accent-[#dc143c] cursor-pointer"
              />
              <div>
                <span className="font-mono text-xs uppercase font-bold text-white block">
                  Activar Promoción de Envío Gratis en Carrito
                </span>
                <span className="text-[11px] font-body text-[#ac8888] block mt-0.5">
                  (Si está desactivada, el carrito NUNCA mostrará la barra de envío gratis ni prometerá envíos gratis).
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 3: GESTIÓN DE SUCURSALES / NODOS                  */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">store</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                Sucursales & Puntos de Despacho ({sucursales.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setShowAddSucursal((prev) => !prev)}
              className="px-3 py-1 bg-[#1c1b1b] hover:bg-[#dc143c] text-[#FAF9F6] text-xs font-mono uppercase font-bold transition-colors border border-[#201f1f] hover:border-[#dc143c] cursor-pointer"
            >
              {showAddSucursal ? 'Cancelar' : '+ Añadir Sucursal'}
            </button>
          </div>

          <p className="text-xs text-[#ac8888] font-sans">
            Gestiona las ubicaciones de despacho de Zairen Lab. Puedes tener una única sucursal o registrar más sucursales a medida que la tienda crezca.
          </p>

          {/* Formulario Agregar Sucursal */}
          {showAddSucursal && (
            <div className="p-4 bg-[#1c1b1b] border border-[#dc143c]/40 space-y-3 animate-in fade-in duration-200">
              <h4 className="font-mono text-xs text-[#ffb3b3] uppercase font-bold">
                Registrar Nueva Sucursal
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Nombre (Ej: Showroom Zona Sur)"
                  value={newSucNombre}
                  onChange={(e) => setNewSucNombre(e.target.value)}
                  className="px-3 py-2 bg-[#141416] text-white font-sans text-xs border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Ciudad (Ej: La Paz, Santa Cruz)"
                  value={newSucCiudad}
                  onChange={(e) => setNewSucCiudad(e.target.value)}
                  className="px-3 py-2 bg-[#141416] text-white font-sans text-xs border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Dirección / Referencia"
                  value={newSucDireccion}
                  onChange={(e) => setNewSucDireccion(e.target.value)}
                  className="px-3 py-2 bg-[#141416] text-white font-sans text-xs border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddSucursal}
                  className="px-4 py-1.5 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase font-bold transition-colors cursor-pointer"
                >
                  Guardar Sucursal
                </button>
              </div>
            </div>
          )}

          {/* Tabla de Sucursales */}
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#1c1b1b] text-[#ac8888] uppercase text-[10px] border-b border-[#201f1f]">
                <tr>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Ciudad</th>
                  <th className="py-2.5 px-3">Dirección</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sucursales.map((suc) => (
                  <tr key={suc.id} className="hover:bg-[#1c1b1b]/50">
                    <td className="py-3 px-3 font-bold text-white">{suc.nombre}</td>
                    <td className="py-3 px-3 text-[#ffb3b3]">{suc.ciudad}</td>
                    <td className="py-3 px-3 text-[#ac8888]">{suc.direccion}</td>
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSucursal(suc.id)}
                        className={`px-2 py-0.5 text-[10px] font-bold uppercase transition-all cursor-pointer border ${
                          suc.activa
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            : 'bg-red-950 text-red-400 border-red-800'
                        }`}
                      >
                        {suc.activa ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSucursal(suc.id)}
                        className="text-[#ac8888] hover:text-[#ff5449] transition-colors p-1 cursor-pointer"
                        title="Eliminar sucursal"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 4: WHATSAPP OFICIAL & CHECKOUT                    */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <span className="material-symbols-outlined text-emerald-400 text-[20px]">chat</span>
            <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
              WhatsApp Oficial & Checkout
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Número Internacional (Sin +)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="59170000000"
                className="w-full px-3.5 py-2 bg-[#1c1b1b] text-[#ffb3b3] font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Número Formato Visible
              </label>
              <input
                type="text"
                value={whatsappDisplay}
                onChange={(e) => setWhatsappDisplay(e.target.value)}
                placeholder="+591 70000000"
                className="w-full px-3.5 py-2 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
              Plantilla Mensaje de Pedido WhatsApp
            </label>
            <textarea
              rows={3}
              value={whatsappTemplate}
              onChange={(e) => setWhatsappTemplate(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
            />
            <span className="font-mono text-[10px] text-[#ac8888] block mt-1">
              Variables disponibles: <code>{'{items}'}</code>, <code>{'{total}'}</code>, <code>{'{moneda}'}</code>
            </span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 5: REDES SOCIALES DINÁMICAS                       */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">share</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                Redes Sociales Dinámicas
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-none bg-[#1c1b1b] text-[#ffb3b3] font-mono text-[10px] uppercase font-bold border border-[#201f1f]">
              {activeSocialsCount} REDES VISIBLES
            </span>
          </div>

          <p className="text-xs text-[#ac8888] font-sans">
            Activa las redes sociales de Zairen Lab. Se renderizarán con sus iconos oficiales en el pie de página y botones de compartir.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {socials.map((social) => (
              <div
                key={social.id}
                className={`p-4 border transition-all rounded-none ${
                  social.enabled && social.url
                    ? 'bg-[#1c1b1b] border-[#dc143c]/40 shadow-[0_0_12px_rgba(220,20,60,0.1)]'
                    : 'bg-[#1c1b1b]/50 border-white/[0.04] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-headline text-xs font-bold text-white uppercase">
                    {social.name}
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="font-mono text-[10px] text-[#ac8888]">
                      {social.enabled ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                    <input
                      type="checkbox"
                      checked={social.enabled}
                      onChange={() => handleToggleSocial(social.id)}
                      className="w-4 h-4 rounded-none accent-[#dc143c] cursor-pointer"
                    />
                  </label>
                </div>

                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => handleUpdateSocialUrl(social.id, e.target.value)}
                  placeholder={`https://${social.id}.com/zairenlab`}
                  className="w-full px-3 py-1.5 bg-[#141416] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECCIÓN 6: APARIENCIA ZEN & PERSONALIZACIÓN DE INTERFAZ    */}
        {/* ======================================================== */}
        <div className="bg-[#141416] p-6 rounded-none border border-[#201f1f] shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">palette</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase tracking-wider">
                Apariencia Zen & Personalización de Interfaz
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-none bg-[#1c1b1b] text-[#ffb3b3] font-mono text-[10px] uppercase font-bold border border-[#201f1f]">
              CONFIG ESTÉTICA
            </span>
          </div>

          <p className="text-xs text-[#ac8888] font-sans">
            Personaliza el acento cromático, el desenfoque glassmorphism y los mensajes de bienvenida automáticos para el cliente.
          </p>

          {/* Color de Estado / Acento */}
          <div className="space-y-3">
            <label className="font-mono text-xs text-[#ac8888] uppercase block">
              Color de Estado & Acento Dinámico
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { name: 'Crimson Official', hex: '#dc143c' },
                { name: 'Steel Sky (Zen)', hex: '#5c88b0' },
                { name: 'Neon Cyber', hex: '#00f0ff' },
                { name: 'Emerald Matrix', hex: '#10b981' },
                { name: 'Tokyo Amber', hex: '#f59e0b' },
                { name: 'Obsidian Violet', hex: '#8b5cf6' },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setAccentColor(c.hex)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-none border font-mono text-xs transition-all cursor-pointer ${
                    accentColor.toLowerCase() === c.hex.toLowerCase()
                      ? 'border-white text-white bg-white/10 shadow-sm'
                      : 'border-white/[0.08] text-[#ac8888] hover:border-white/30'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 border border-white/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}

              {/* Color Personalizado Input */}
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-7 h-7 bg-transparent cursor-pointer border border-white/20"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-24 px-2 py-1 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:outline-none"
                  placeholder="#dc143c"
                />
              </div>
            </div>
          </div>

          {/* Intensidad de Desenfoque (Glassmorphism Blur) */}
          <div className="space-y-3 pt-2">
            <label className="font-mono text-xs text-[#ac8888] uppercase block">
              Desenfoque Glassmorphism (Backdrop Blur)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: '0px', label: '0px (Nítido / Sin Blur)' },
                { id: '8px', label: '8px (Sutil)' },
                { id: '16px', label: '16px (Estándar Zen)' },
                { id: '24px', label: '24px (Profundo Glass)' },
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBlurIntensity(b.id)}
                  className={`py-2 px-3 text-center rounded-none font-mono text-xs border transition-all cursor-pointer ${
                    blurIntensity === b.id
                      ? 'bg-[#dc143c]/20 border-[#dc143c] text-white font-bold'
                      : 'bg-[#1c1b1b] border-white/[0.08] text-[#ac8888] hover:text-white'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saludo Personalizado para Consultas */}
          <div className="space-y-2 pt-2">
            <label className="font-mono text-xs text-[#ac8888] uppercase block">
              Mensaje de Saludo Automático (Contacto & Producto)
            </label>
            <input
              type="text"
              value={customGreeting}
              onChange={(e) => setCustomGreeting(e.target.value)}
              placeholder="Hola Zairen Lab, me interesa consultar sobre una prenda del catálogo:"
              className="w-full px-3.5 py-2 bg-[#1c1b1b] text-white font-mono text-xs rounded-none border border-[#201f1f] focus:border-[#dc143c] focus:outline-none"
            />
            <span className="font-mono text-[10px] text-[#ac8888] block">
              Texto predeterminado que precede las consultas directas en WhatsApp y modal de producto.
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
