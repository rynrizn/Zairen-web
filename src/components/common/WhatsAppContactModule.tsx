import React, { useState } from 'react';
import { siteConfig } from '../../config/site';

export function WhatsAppContactModule() {
  const [topic, setTopic] = useState<string>('catalogo');
  const [customNote, setCustomNote] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');

  const topics = [
    {
      id: 'catalogo',
      title: 'Disponibilidad & Drops',
      desc: 'Preguntas sobre tallas, disponibilidad y lanzamientos.',
      defaultMsg: 'Hola Zairen Lab, quisiera consultar sobre la disponibilidad de prendas y próximos drops.',
    },
    {
      id: 'cotizacion',
      title: 'Cotización & Encargos',
      desc: 'Cotización para proyectos especiales y pedidos exclusivos.',
      defaultMsg: 'Hola Zairen Lab, me gustaría realizar una cotización para un pedido con ustedes.',
    },
    {
      id: 'entregas',
      title: 'Consultas de Entrega',
      desc: 'Información directa sobre tiempos y coordinación de despacho.',
      defaultMsg: 'Hola Zairen Lab, deseo consultar sobre la coordinación y tiempos de entrega.',
    },
    {
      id: 'tallas',
      title: 'Asesoría de Medidas',
      desc: 'Orientación para elegir la talla boxy oversized ideal.',
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
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-[#141416]/90 backdrop-blur-2xl border border-white/[0.08] p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Lado Izquierdo: Info & Teléfono (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-[10px] font-mono uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
              CANAL DIRECTO
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#FAF9F6]">
              Atención Directa por WhatsApp
            </h3>
            <p className="text-xs md:text-sm font-body text-[#8F8F8C] leading-relaxed">
              Comunicación directa con la tienda oficial. Resolvemos cualquier duda sobre prendas, tallas o cotizaciones especiales.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] space-y-2">
            <div className="text-[10px] font-mono text-[#8F8F8C] uppercase tracking-wider">
              LÍNEA OFICIAL DE ATENCIÓN
            </div>
            <div className="font-mono text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#25D366]">chat</span>
              <span>{siteConfig.whatsapp.displayNumber}</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Atención personalizada</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Selector Interactivo & Formulario (7 cols) */}
        <form onSubmit={handleSendMessage} className="lg:col-span-7 flex flex-col space-y-4">
          <label className="text-xs font-mono uppercase text-[#FAF9F6] font-bold tracking-wider">
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
                      : 'bg-[#1c1b1b] border-white/[0.06] text-[#8F8F8C] hover:text-white hover:bg-[#201f1f]'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-[#FAF9F6]">{t.title}</div>
                  <div className="text-[10px] font-body text-[#8F8F8C] line-clamp-1 mt-0.5">{t.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label htmlFor="client-name" className="text-[11px] font-mono uppercase text-[#8F8F8C] block mb-1">
                Tu Nombre (Opcional):
              </label>
              <input
                id="client-name"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Ej: Mateo"
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#dc143c] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="custom-details" className="text-[11px] font-mono uppercase text-[#8F8F8C] block mb-1">
                Detalles Adicionales (Opcional):
              </label>
              <textarea
                id="custom-details"
                rows={2}
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Escribe aquí cualquier consulta o especificación..."
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-xl p-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#dc143c] transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-[#0A0A0A] font-mono text-xs uppercase tracking-wider font-bold shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.37C9.37 7.37 9.1 7.43 8.88 7.68C8.65 7.92 8.02 8.51 8.02 9.73C8.02 10.95 8.91 12.12 9.03 12.28C9.16 12.45 10.77 14.93 13.23 16C13.82 16.25 14.28 16.41 14.63 16.52C15.22 16.71 15.77 16.68 16.2 16.62C16.67 16.55 17.65 16.03 17.86 15.45C18.06 14.86 18.06 14.36 18 14.26C17.94 14.15 17.79 14.09 17.56 13.98C17.34 13.87 16.25 13.33 16.05 13.26C15.84 13.18 15.69 13.15 15.54 13.38C15.38 13.61 14.94 14.15 14.81 14.3C14.68 14.45 14.54 14.47 14.32 14.36C14.09 14.24 13.37 14.01 12.52 13.25C11.86 12.66 11.41 11.93 11.29 11.71C11.16 11.49 11.27 11.37 11.39 11.25C11.49 11.14 11.62 10.98 11.73 10.84C11.85 10.71 11.89 10.61 11.96 10.46C12.04 10.31 12 10.18 11.94 10.07C11.89 9.96 11.43 8.84 11.25 8.38C11.06 7.93 10.88 7.99 10.74 7.99C10.61 7.98 10.46 7.98 10.31 7.98C10.16 7.98 9.91 8.04 9.71 8.25C9.53 8.46 9.53 7.37 9.53 7.37Z"/>
              </svg>
              <span>Abrir Conversación en WhatsApp</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
