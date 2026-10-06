import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MatrizStock, type StockBySize } from './MatrizStock';

export interface InventarioItem {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  coleccion: string;
  precio: number;
  costo: number;
  stock: StockBySize;
  tejido: string;
  construccion: string;
  estampado: string;
  imagen: string;
  imagenDorsal?: string;
  publicado: boolean;
  destacado: boolean;
}

interface ProductoEditorProps {
  product: InventarioItem | null;
  onSave: (item: InventarioItem) => void;
  onClose: () => void;
}

export function ProductoEditor({ product, onSave, onClose }: ProductoEditorProps) {
  const [sku, setSku] = useState(product?.sku || 'ZRN-NEW');
  const [nombre, setNombre] = useState(product?.nombre || '');
  const [coleccion, setColeccion] = useState(product?.coleccion || 'Anime Mecha // Drop 01');
  const [precio, setPrecio] = useState<number>(product?.precio || 145);
  const [costo, setCosto] = useState<number>(product?.costo || 55);
  const [tejido, setTejido] = useState(product?.tejido || 'Algodón Peinado 280 GSM');
  const [construccion, setConstruccion] = useState(
    product?.construccion || 'Cuello Ribete 3.5cm // Doble Pespunte'
  );
  const [estampado, setEstampado] = useState(
    product?.estampado || 'Serigrafía tacto cero 4 tintas Neón'
  );
  const [imagen, setImagen] = useState(
    product?.imagen ||
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop'
  );
  const [imagenDorsal, setImagenDorsal] = useState(
    product?.imagenDorsal ||
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=800&auto=format&fit=crop'
  );
  const [publicado, setPublicado] = useState<boolean>(product ? product.publicado : true);
  const [destacado, setDestacado] = useState<boolean>(product ? product.destacado : false);
  const [stock, setStock] = useState<StockBySize>(
    product?.stock || { S: 4, M: 10, L: 8, XL: 2 }
  );

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setNombre(product.nombre);
      setColeccion(product.coleccion);
      setPrecio(product.precio);
      setCosto(product.costo);
      setTejido(product.tejido);
      setConstruccion(product.construccion);
      setEstampado(product.estampado);
      setImagen(product.imagen);
      setImagenDorsal(product.imagenDorsal || '');
      setPublicado(product.publicado);
      setDestacado(product.destacado);
      setStock(product.stock);
    } else {
      setSku(`ZRN-${Math.floor(100 + Math.random() * 900)}`);
      setNombre('');
      setColeccion('Anime Mecha // Drop 01');
      setPrecio(145);
      setCosto(55);
      setStock({ S: 0, M: 0, L: 0, XL: 0 });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre de la prenda es obligatorio');
      return;
    }

    const slug = nombre
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const updatedItem: InventarioItem = {
      id: product?.id || `prod-${Date.now()}`,
      sku,
      nombre,
      slug,
      coleccion,
      precio: Number(precio) || 0,
      costo: Number(costo) || 0,
      stock,
      tejido,
      construccion,
      estampado,
      imagen,
      imagenDorsal,
      publicado,
      destacado,
    };

    onSave(updatedItem);
    toast.success(product ? 'Prenda actualizada con éxito' : 'Nueva prenda registrada en inventario', {
      description: `SKU: ${sku} • Stock total: ${Object.values(stock).reduce((a, b) => a + b, 0)} uds`,
    });
  };

  const handlePromptImageUrl = (type: 'frontal' | 'dorsal') => {
    const url = prompt(
      `Ingresar URL de la imagen ${type === 'frontal' ? 'Frontal' : 'Dorsal'} o de Cloudinary:`
    );
    if (url && url.startsWith('http')) {
      if (type === 'frontal') setImagen(url);
      else setImagenDorsal(url);
      toast.success(`Imagen ${type} actualizada`);
    }
  };

  return (
    <div className="bg-[#1c1b1b]/95 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.6)] relative overflow-hidden flex flex-col space-y-5">
      {/* Indicador carmesí superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#dc143c] via-[#ff2d55] to-[#dc143c]"></div>

      {/* Header del Formulario */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#dc143c]/20 flex items-center justify-center text-[#dc143c]">
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#dc143c] uppercase tracking-widest block leading-none">
              {product ? 'EDITING ASSET // ARCHIVE CORE' : 'CREATING NEW ASSET // DROP ARCHIVE'}
            </span>
            <h2 className="font-headline text-lg font-bold text-[#e5e2e1] uppercase mt-0.5">
              {nombre || 'NUEVA PRENDA STREETWEAR'}{' '}
              <span className="text-[#dc143c] font-mono text-xs">// {sku}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-[#2a2a2a] font-mono text-[11px] text-[#ffb3b3]">
            {product ? `ID: ${product.id}` : 'NUEVO REGISTRO'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#353534] text-[#e5e2e1] flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar editor"
          >
            ✕
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna Izquierda: Galería y Atributos Generales (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Galería de Fotos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider">
                  Galería de Imágenes (Dropzone / Cloudinary)
                </label>
                <span className="font-mono text-[10px] text-[#dc143c]">2 SLOTS ACTIVOS</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Frontal */}
                <div className="relative group rounded-xl overflow-hidden aspect-[4/5] bg-[#141416] border border-white/[0.06]">
                  <img src={imagen} alt="Frontal" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <span className="absolute bottom-1 left-1 bg-[#141416]/80 backdrop-blur-md px-1.5 py-0.5 rounded font-mono text-[9px] text-white uppercase">
                    Frontal
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePromptImageUrl('frontal')}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#141416]/80 text-[#dc143c] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                    title="Cambiar URL"
                  >
                    ✎
                  </button>
                </div>

                {/* Dorsal */}
                <div className="relative group rounded-xl overflow-hidden aspect-[4/5] bg-[#141416] border border-white/[0.06]">
                  {imagenDorsal ? (
                    <>
                      <img src={imagenDorsal} alt="Dorsal" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <span className="absolute bottom-1 left-1 bg-[#141416]/80 backdrop-blur-md px-1.5 py-0.5 rounded font-mono text-[9px] text-white uppercase">
                        Dorsal
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePromptImageUrl('dorsal')}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-[#141416]/80 text-[#dc143c] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs"
                        title="Cambiar URL"
                      >
                        ✎
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handlePromptImageUrl('dorsal')}
                      className="w-full h-full flex flex-col items-center justify-center text-center p-2 text-[#ac8888] hover:text-[#dc143c] transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                      <span className="font-mono text-[9px] mt-1 uppercase">+ Dorsal</span>
                    </button>
                  )}
                </div>

                {/* Slot adicional / Cloudinary upload */}
                <div
                  onClick={() => handlePromptImageUrl('frontal')}
                  className="rounded-xl aspect-[4/5] bg-[#141416]/50 hover:bg-[#201f1f] border border-dashed border-white/[0.1] hover:border-[#dc143c] flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-colors group"
                >
                  <span className="material-symbols-outlined text-[#ac8888] group-hover:text-[#dc143c] transition-colors text-[24px]">
                    cloud_upload
                  </span>
                  <span className="font-mono text-[9px] text-[#ac8888] group-hover:text-white mt-1 uppercase">
                    Cargar URL / Cloud
                  </span>
                </div>
              </div>
            </div>

            {/* Identificadores */}
            <div className="space-y-3">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Nombre de la Prenda
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Samurai Mecha Kanji // Oversized Tee"
                  className="w-full bg-[#141416] text-[#e5e2e1] font-sans text-sm px-3.5 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    placeholder="ZRN-044"
                    className="w-full bg-[#141416] text-[#ffb3b3] font-mono text-xs uppercase px-3.5 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                    Colección / Drop
                  </label>
                  <select
                    value={coleccion}
                    onChange={(e) => setColeccion(e.target.value)}
                    className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                  >
                    <option value="Anime Mecha // Drop 01">Anime Mecha // Drop 01</option>
                    <option value="Streetwear Zen // Core">Streetwear Zen // Core</option>
                    <option value="Cyberpunk Tokyo // Spec">Cyberpunk Tokyo // Spec</option>
                    <option value="Tokyo Archive // Limited">Tokyo Archive // Limited</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                    Precio Venta (BOB)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#dc143c] font-bold">
                      Bs
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={precio}
                      onChange={(e) => setPrecio(parseFloat(e.target.value))}
                      className="w-full bg-[#141416] text-white font-price text-sm pl-9 pr-3 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                    Costo Producción (BOB)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#ac8888]">
                      Bs
                    </span>
                    <input
                      type="number"
                      step="0.5"
                      value={costo}
                      onChange={(e) => setCosto(parseFloat(e.target.value))}
                      className="w-full bg-[#141416] text-white font-price text-sm pl-9 pr-3 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Ficha Técnica */}
              <div className="space-y-2 pt-2 border-t border-white/[0.04]">
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block">
                  Ficha Técnica Textil
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tejido}
                    onChange={(e) => setTejido(e.target.value)}
                    placeholder="Tejido: Ej. Algodón Peinado 280 GSM"
                    className="w-full bg-[#141416] text-xs font-mono text-[#e5e2e1] px-3 py-1.5 rounded-lg border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={construccion}
                    onChange={(e) => setConstruccion(e.target.value)}
                    placeholder="Construcción: Ej. Cuello Ribete 3.5cm // Doble Pespunte"
                    className="w-full bg-[#141416] text-xs font-mono text-[#e5e2e1] px-3 py-1.5 rounded-lg border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={estampado}
                    onChange={(e) => setEstampado(e.target.value)}
                    placeholder="Estampado: Ej. Serigrafía tacto cero 4 tintas Neón"
                    className="w-full bg-[#141416] text-xs font-mono text-[#e5e2e1] px-3 py-1.5 rounded-lg border border-white/[0.06] focus:border-[#dc143c] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Matriz de Stock, Switches & Live Preview (5 cols) */}
          <div className="md:col-span-5 space-y-4 flex flex-col justify-between">
            {/* Matriz de Stock Island */}
            <MatrizStock stock={stock} onChange={setStock} />

            {/* Switches de Visibilidad */}
            <div className="space-y-2.5 bg-[#141416] p-3 rounded-xl border border-white/[0.06]">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#dc143c]">public</span>
                  <span className="font-mono text-xs text-[#e5e2e1] uppercase">Publicar en Web</span>
                </div>
                <input
                  type="checkbox"
                  checked={publicado}
                  onChange={(e) => setPublicado(e.target.checked)}
                  className="w-4 h-4 accent-[#dc143c] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#dc143c]">star</span>
                  <span className="font-mono text-xs text-[#e5e2e1] uppercase">Destacado Portada</span>
                </div>
                <input
                  type="checkbox"
                  checked={destacado}
                  onChange={(e) => setDestacado(e.target.checked)}
                  className="w-4 h-4 accent-[#dc143c] cursor-pointer"
                />
              </label>
            </div>

            {/* Mini Client Preview Card */}
            <div className="bg-[#141416] p-3 rounded-xl border border-white/[0.06] relative">
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#dc143c] font-mono text-[9px] text-white uppercase font-bold tracking-wider">
                Preview Web
              </span>
              <div className="flex items-center gap-3">
                <div className="w-14 h-18 rounded-lg overflow-hidden shrink-0 bg-[#201f1f] border border-white/[0.06]">
                  <img src={imagen} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 pr-14">
                  <div className="font-mono text-[10px] text-[#dc143c] uppercase truncate">
                    {coleccion}
                  </div>
                  <div className="font-headline text-xs font-bold text-[#e5e2e1] truncate mt-0.5">
                    {nombre || 'Nombre de la Prenda'}
                  </div>
                  <div className="font-price text-sm font-bold text-white mt-1">
                    Bs {Number(precio || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#2a2a2a] hover:bg-[#353534] text-[#e5e2e1] font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Descartar
          </button>
          <button
            type="submit"
            className="px-7 py-2.5 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-headline text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_4px_24px_rgba(220,20,60,0.4)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
}
