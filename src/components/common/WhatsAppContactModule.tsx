import React, { useState } from 'react';
import { siteConfig } from '../../config/site';

export function WhatsAppContactModule() {
  const [topic, setTopic] = useState<string>('catalogo');
  const [customNote, setCustomNote] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  const topics = [
    {
      id: 'catalogo',
      title: '📦 Disponibilidad & Drops',
      desc: 'Preguntas sobre tallas, disponibilidad inmediata y nuevos lanzamientos.',
      defaultMsg: 'Hola Zairen Lab, quisiera consultar sobre la disponibilidad de prendas y próximos drops.',
    },
    {
      id: 'personalizadas',
      title: '✂️ Prendas Personalizadas',
      desc: 'Confección para proyectos especiales, colaboraciones y taller.',
      defaultMsg: 'Hola Zairen Lab, me gustaría cotizar una prenda personalizada con ustedes.',
    },
    {
      id: 'envios',
      title: '🚚 Envíos Tarija y Bolivia',
      desc: 'Tiempos de entrega express (24-48h) y cobertura nacional.',
      defaultMsg: 'Hola Zairen Lab, deseo coordinar un envío y conocer los costos/tiempos hacia mi ciudad.',
    },
    {
      id: 'tallas',
      title: '📏 Asesoría de Medidas',
      desc: 'Ayuda para elegir la talla boxy oversized perfecta.',
      defaultMsg: 'Hola Zairen Lab, necesito orientación para elegir mi talla de acuerdo a mis medidas.',
    },
  ];

  const currentTopicObj = topics.find((t) => t.id === topic) || topics[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    let fullMessage = currentTopicObj.defaultMsg;
    if (clientName.trim()) {
      fullMessage = `Hola Zairen Lab, mi nombre es *${clientName.trim()}*.\n\n${fullMessage}`;
    }
    if (customNote.trim()) {
      fullMessage += `\n\n*Detalles adicionales:*\n${customNote.trim()}`;
    }

    const encoded = encodeURIComponent(fullMessage);
    const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[#141416]/90 backdrop-blur-2xl border border-white/[0.08] p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Lado Izquierdo: Info & Teléfono (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-[10px] font-mono uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
              CONCIERGE DIRECTO // 24/7
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#FAF9F6]">
              Atención Directa por WhatsApp
            </h3>
            <p className="text-xs md:text-sm font-body text-[#ac8888] leading-relaxed">
              Sin intermediarios ni bots automáticos. Escribe directamente a nuestro equipo de taller en Tarija, Bolivia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] space-y-2">
            <div className="text-[10px] font-mono text-[#ac8888] uppercase tracking-wider">
              LÍNEA OFICIAL VERIFICADA
            </div>
            <div className="font-mono text-lg font-bold text-white flex items-center gap-2">
              <span className="text-[#25D366]">📱</span>
              <span>{siteConfig.whatsapp.displayNumber}</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Respuesta promedio: &lt; 15 minutos</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Selector Interactivo & Formulario (7 cols) */}
        <form onSubmit={handleSendMessage} className="lg:col-span-7 flex flex-col space-y-4">
          <label className="text-xs font-mono uppercase text-[#e5e2e1] font-bold tracking-wider">
            1. Selecciona el motivo de tu consulta:
          </label>

          {/* Opciones de Asunto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topics.map((t) => {
              const isSelected = topic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#dc143c]/15 border-[#dc143c] text-white shadow-[0_0_12px_rgba(220,20,60,0.3)]'
                      : 'bg-[#1c1b1b] border-white/[0.06] text-[#ac8888] hover:text-white hover:bg-[#201f1f]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-[#FAF9F6]">{t.title}</div>
                  <div className="text-[10px] font-body text-[#ac8888] line-clamp-1 mt-0.5">{t.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] font-mono uppercase text-[#ac8888] block mb-1">
                Tu Nombre (Opcional):
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Mateo R."
                className="w-full bg-[#1c1b1b] border border-white/[0.08] focus:border-[#dc143c] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-[#ac8888]/50 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-[#ac8888] block mb-1">
                Mensaje o prenda de interés (Opcional):
              </label>
              <textarea
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="¿Qué prenda o duda deseas consultar?"
                className="w-full bg-[#1c1b1b] border border-white/[0.08] focus:border-[#dc143c] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-[#ac8888]/50 focus:outline-none transition-colors resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-black font-mono text-xs uppercase tracking-widest font-bold shadow-[0_4px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_32px_rgba(37,211,102,0.6)] transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-2"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.771.867 2.796.867 3.182 0 5.768-2.587 5.769-5.769.001-3.181-2.587-5.768-5.769-5.769zm3.393 8.163c-.144.405-.837.774-1.17.822-.312.043-.687.069-2.029-.487-1.717-.711-2.825-2.457-2.91-2.57-.085-.114-.695-.923-.695-1.761s.44-1.25.597-1.423c.156-.173.342-.216.456-.216.114 0 .228.002.328.007.106.005.249-.04.389.297.144.347.49 1.196.533 1.284.043.088.072.19.014.305-.058.115-.087.186-.173.288-.086.102-.18.228-.257.306-.086.088-.176.184-.076.356.1.172.443.731.95 1.183.653.582 1.204.762 1.376.848.172.086.273.072.373-.043.101-.115.432-.503.548-.676.115-.173.23-.144.388-.086.158.058 1.002.472 1.175.558.172.086.287.13.33.202.043.072.043.418-.101.823z" />
            </svg>
            <span>Iniciar Conversación por WhatsApp</span>
          </button>
        </form>
      </div>
    </div>
  );
}
