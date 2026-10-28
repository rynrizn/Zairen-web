import React, { useState } from 'react';
import { siteConfig } from '../../config/site';
import { MessageCircle, ArrowRight } from 'lucide-react';

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
    <div className="w-full max-w-4xl mx-auto rounded-none bg-[#141416]/90 backdrop-blur-2xl border border-white/[0.08] p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-colors">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Lado Izquierdo: Info & Teléfono (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-[10px] font-mono uppercase tracking-widest font-bold">
              <span className="w-2 h-2 rounded-none bg-[#25D366] animate-pulse"></span>
              CANAL DIRECTO
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#FAF9F6]">
              Atención Directa por WhatsApp
            </h3>
            <p className="text-xs md:text-sm font-body text-[#8F8F8C] leading-relaxed">
              Comunicación directa con la tienda oficial. Resolvemos cualquier duda sobre prendas, tallas o pedidos especiales.
            </p>
          </div>

          <div className="p-4 rounded-none bg-[#0a0a0a] border border-white/[0.06] space-y-2">
            <div className="text-[10px] font-mono text-[#8F8F8C] uppercase tracking-wider">
              LÍNEA OFICIAL DE ATENCIÓN
            </div>
            <div className="font-mono text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              <span>{siteConfig.whatsapp.displayNumber}</span>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-400"></span>
              <span>Atención personalizada</span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Selector Interactivo & Formulario (7 cols) */}
        <form onSubmit={handleSendMessage} className="lg:col-span-7 flex flex-col space-y-4">
          <label className="text-xs font-mono uppercase text-[#FAF9F6] font-bold tracking-wider">
            1. Selecciona el motivo de tu consulta:
          </label>

          {/* Opciones de Asunto Ortogonales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topics.map((t) => {
              const isSelected = topic === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTopic(t.id)}
                  className={`p-3 rounded-none text-left transition-all cursor-pointer border ${
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
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-none px-4 py-2.5 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#dc143c] transition-colors"
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
                className="w-full bg-[#0a0a0a] border border-white/[0.08] rounded-none p-3 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-[#dc143c] transition-colors resize-none"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-none bg-[#25D366] hover:bg-[#20ba59] text-[#0A0A0A] font-mono text-xs uppercase tracking-wider font-bold shadow-[0_4px_20px_rgba(37,211,102,0.35)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 text-[#0A0A0A]" />
              <span>Abrir Conversación en WhatsApp</span>
              <ArrowRight className="w-4 h-4 text-[#0A0A0A]" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
