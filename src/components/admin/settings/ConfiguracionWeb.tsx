import React, { useState } from 'react';
import { toast } from 'sonner';
import { siteConfig, type SocialNetwork } from '../../../config/site';

export function ConfiguracionWeb() {
  const [brandName, setBrandName] = useState(siteConfig.name);
  const [brandSlogan, setBrandSlogan] = useState(siteConfig.slogan);
  const [whatsappNumber, setWhatsappNumber] = useState(siteConfig.whatsapp.number);
  const [whatsappDisplay, setWhatsappDisplay] = useState(siteConfig.whatsapp.displayNumber);
  const [whatsappTemplate, setWhatsappTemplate] = useState(siteConfig.whatsapp.messageTemplate);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    siteConfig.shipping.freeShippingThreshold
  );
  const [expressShippingCost, setExpressShippingCost] = useState(
    siteConfig.shipping.expressShippingCost
  );
  const [deliveryTime, setDeliveryTime] = useState(siteConfig.shipping.deliveryTimeExpress);
  const [bannerText, setBannerText] = useState(
    'FREE SHIPPING EN PEDIDOS > BS 250 // ENVÍOS EXPRESS A TODA BOLIVIA'
  );
  const [bannerActive, setBannerActive] = useState(true);

  // Redes sociales dinámicas
  const [socials, setSocials] = useState<SocialNetwork[]>([
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://instagram.com/zairenlab',
      enabled: true,
      icon: 'Instagram',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: 'https://tiktok.com/@zairenlab',
      enabled: true,
      icon: 'Video',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: '',
      enabled: false,
      icon: 'Facebook',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: '',
      enabled: false,
      icon: 'Youtube',
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      url: '',
      enabled: false,
      icon: 'Twitter',
    },
  ]);

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

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Configuración de la tienda guardada con éxito', {
      description: 'Los cambios se reflejarán en toda la web pública y en el canal de WhatsApp.',
    });
  };

  const activeSocialsCount = socials.filter((s) => s.enabled && s.url.trim() !== '').length;

  return (
    <div className="flex flex-col gap-8">
      {/* 1. Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#dc143c] animate-pulse"></span>
            <span className="font-mono text-xs text-[#dc143c] uppercase tracking-wider font-bold">
              CMS // AJUSTES DE MARCA Y REDES
            </span>
          </div>
          <h1 className="font-headline text-3xl md:text-5xl font-bold text-[#e5e2e1] uppercase tracking-tight">
            INTERFAZ WEB <span className="text-[#dc143c] text-xl font-mono font-normal">// BRAND & SOCIAL CHANNELS</span>
          </h1>
          <div className="h-0.5 w-72 bg-gradient-to-r from-[#dc143c] via-[#dc143c]/40 to-transparent mt-2"></div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          className="px-6 py-2.5 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_20px_rgba(220,20,60,0.35)] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">save</span>
          <span>Guardar Configuración</span>
        </button>
      </div>

      {/* 2. Banner de Información de Archivos de Código */}
      <div className="p-4 rounded-2xl bg-[#141416] border border-white/[0.08] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#dc143c] text-[24px] mt-0.5">info</span>
        <div className="space-y-1 text-xs">
          <h4 className="font-headline text-white font-bold uppercase">
            ¿DÓNDE SE EDITAN LAS VARIABLES EN EL CÓDIGO?
          </h4>
          <p className="text-[#ac8888] font-sans">
            Para editar el número de celular o redes directamente en el proyecto, puedes modificar:
          </p>
          <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded-md bg-[#201f1f] text-[#ffb3b3] border border-white/[0.06]">
              📄 src/config/site.ts
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#201f1f] text-[#ffb3b3] border border-white/[0.06]">
              📄 .env
            </span>
          </div>
          <p className="text-[#e5e2e1] font-mono text-[11px] pt-1">
            ✓ <strong>Comportamiento dinámico:</strong> Si solo dejas configurado Instagram, o Instagram y TikTok, solo aparecerán las que tengan URL válida. Las demás se ocultan automáticamente en el Navbar, Footer y Carrito.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-8">
        {/* 3. Sección: Identidad de Marca y WhatsApp */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Identidad */}
          <div className="bg-[#1c1b1b]/90 p-6 rounded-2xl border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">storefront</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase">
                Identidad de Marca
              </h3>
            </div>

            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Nombre de la Marca
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141416] text-white font-sans text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Eslogan Oficial
              </label>
              <input
                type="text"
                value={brandSlogan}
                onChange={(e) => setBrandSlogan(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141416] text-white font-mono text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Banner de Anuncio Promocional (Top Bar)
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#141416] text-white font-sans text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
                />
                <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-[#e5e2e1]">
                  <input
                    type="checkbox"
                    checked={bannerActive}
                    onChange={(e) => setBannerActive(e.target.checked)}
                    className="w-4 h-4 accent-[#dc143c]"
                  />
                  <span>Mostrar banner animado en la parte superior del catálogo</span>
                </label>
              </div>
            </div>
          </div>

          {/* WhatsApp & Checkout */}
          <div className="bg-[#1c1b1b]/90 p-6 rounded-2xl border border-white/[0.08] shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
              <span className="material-symbols-outlined text-emerald-400 text-[20px]">chat</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase">
                WhatsApp Oficial & Checkout
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                  Número Internacional (Sin +)
                </label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="59174522654"
                  className="w-full px-3.5 py-2 bg-[#141416] text-[#ffb3b3] font-mono text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
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
                  placeholder="+591 74522654"
                  className="w-full px-3.5 py-2 bg-[#141416] text-white font-mono text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
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
                className="w-full px-3.5 py-2 bg-[#141416] text-white font-mono text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
              <span className="font-mono text-[10px] text-[#ac8888] block mt-1">
                Variables disponibles: <code>{'{items}'}</code>, <code>{'{total}'}</code>, <code>{'{moneda}'}</code>
              </span>
            </div>
          </div>
        </div>

        {/* 4. Sección: Redes Sociales Dinámicas */}
        <div className="bg-[#1c1b1b]/90 p-6 rounded-2xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#dc143c] text-[20px]">share</span>
              <h3 className="font-headline text-sm font-bold text-white uppercase">
                Redes Sociales Dinámicas
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#141416] text-[#ffb3b3] font-mono text-[10px] uppercase font-bold">
              {activeSocialsCount} REDES VISIBLES EN TIENDA
            </span>
          </div>

          <p className="text-xs text-[#ac8888] font-sans">
            Activa solo las redes sociales que utilizas. Si dejas el interruptor apagado o dejas el enlace vacío, la red desaparecerá por completo de los menús y pie de página sin romper el diseño.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {socials.map((social) => (
              <div
                key={social.id}
                className={`p-4 rounded-xl border transition-all ${
                  social.enabled && social.url
                    ? 'bg-[#141416] border-[#dc143c]/40 shadow-[0_0_12px_rgba(220,20,60,0.1)]'
                    : 'bg-[#141416]/50 border-white/[0.04] opacity-60'
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
                      className="w-4 h-4 accent-[#dc143c] cursor-pointer"
                    />
                  </label>
                </div>

                <input
                  type="url"
                  value={social.url}
                  onChange={(e) => handleUpdateSocialUrl(social.id, e.target.value)}
                  placeholder={`https://${social.id}.com/tu-marca`}
                  className="w-full px-3 py-1.5 bg-[#1c1b1b] text-white font-mono text-xs rounded-lg border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Sección: Envíos & Políticas */}
        <div className="bg-[#1c1b1b]/90 p-6 rounded-2xl border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <span className="material-symbols-outlined text-[#dc143c] text-[20px]">local_shipping</span>
            <h3 className="font-headline text-sm font-bold text-white uppercase">
              Políticas de Envío y Tarifas
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Umbral Envío Gratis (Bs)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#141416] text-white font-price text-sm rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Costo Envío Express (Bs)
              </label>
              <input
                type="number"
                value={expressShippingCost}
                onChange={(e) => setExpressShippingCost(parseFloat(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#141416] text-white font-price text-sm rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase block mb-1">
                Tiempo de Entrega
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#141416] text-white font-mono text-xs rounded-xl border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botón Inferior */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-8 py-3 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_4px_24px_rgba(220,20,60,0.4)] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            <span>Guardar Todos los Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
}
