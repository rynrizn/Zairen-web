import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MatrizStock, type StockBySize } from './MatrizStock';
import { uploadImageToCloudinary } from '../../../lib/imageUploader';

export interface InventarioItem {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  coleccion: string;
  seccion?: string;
  tipo?: string;
  precio: number;
  costo: number;
  stock: StockBySize;
  tejido?: string;
  construccion?: string;
  estampado?: string;
  imagen: string;
  imagenDorsal?: string;
  imagenes?: string[];
  estadoComercial?: 'nuevo' | 'disponible' | 'preventa' | 'oferta' | 'agotado';
  tallas?: string[];
  descripcion?: string;
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
  const [coleccion, setColeccion] = useState(product?.coleccion || 'Essentials');
  const [seccionNueva, setSeccionNueva] = useState('');
  const [tipo, setTipo] = useState(product?.tipo || 'Polera');
  const [tipoNuevo, setTipoNuevo] = useState('');
  const [precio, setPrecio] = useState<number>(product?.precio || 145);
  const [costo, setCosto] = useState<number>(product?.costo || 55);
  const [estadoComercial, setEstadoComercial] = useState<'nuevo' | 'disponible' | 'preventa' | 'oferta' | 'agotado'>(
    product?.estadoComercial || 'nuevo'
  );
  const [tallasTexto, setTallasTexto] = useState<string>(
    product?.tallas && product.tallas.length > 0
      ? product.tallas.join(', ')
      : 'S, M, L, XL'
  );
  const [descripcion, setDescripcion] = useState<string>(
    product?.descripcion || 'Polera oversize con cuello estructurado en algodón pesado.'
  );
  const [imagenes, setImagenes] = useState<string[]>(
    product?.imagenes && product.imagenes.length > 0
      ? product.imagenes
      : product?.imagen
      ? [product.imagen]
      : []
  );
  const [inputUrl, setInputUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [publicado, setPublicado] = useState<boolean>(product ? product.publicado : true);
  const [destacado, setDestacado] = useState<boolean>(product ? product.destacado : false);
  const [stock, setStock] = useState<StockBySize>(
    product?.stock || { S: 4, M: 10, L: 8, XL: 2 }
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setSku(product.sku);
      setNombre(product.nombre);
      setColeccion(product.coleccion || product.seccion || 'Essentials');
      setTipo(product.tipo || 'Polera');
      setPrecio(product.precio);
      setCosto(product.costo || 55);
      setEstadoComercial(product.estadoComercial || 'disponible');
      setTallasTexto(
        product.tallas && product.tallas.length > 0
          ? product.tallas.join(', ')
          : 'S, M, L, XL'
      );
      setDescripcion(product.descripcion || '');
      setImagenes(
        product.imagenes && product.imagenes.length > 0
          ? product.imagenes
          : product.imagen
          ? [product.imagen]
          : []
      );
      setPublicado(product.publicado);
      setDestacado(product.destacado);
      setStock(product.stock);
    } else {
      setSku(`ZRN-${Math.floor(100 + Math.random() * 900)}`);
      setNombre('');
      setColeccion('Essentials');
      setTipo('Polera');
      setPrecio(145);
      setCosto(55);
      setEstadoComercial('nuevo');
      setTallasTexto('S, M, L, XL');
      setDescripcion('');
      setImagenes([]);
      setStock({ S: 0, M: 0, L: 0, XL: 0 });
    }
  }, [product]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imagenes.length + files.length > 5) {
      toast.error('Máximo 5 imágenes por producto');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Subiendo imagen a Cloudinary...');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadImageToCloudinary(file, 'zairen/productos');
        if (res.success && res.url) {
          setImagenes((prev) => [...prev, res.url]);
        } else {
          toast.error(`Error al subir ${file.name}: ${res.error}`);
        }
      }
      toast.success('Imágenes optimizadas en WebP añadidas', { id: toastId });
    } catch {
      toast.error('Ocurrió un error inesperado al subir', { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    if (!inputUrl.trim()) return;
    if (imagenes.length >= 5) {
      toast.error('Límite de 5 imágenes alcanzado');
      return;
    }
    setImagenes((prev) => [...prev, inputUrl.trim()]);
    setInputUrl('');
    toast.info('Imagen añadida desde URL');
  };

  const handleRemoveImage = (index: number) => {
    setImagenes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    setImagenes((prev) => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
    toast.success('Imagen principal reasignada');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre de la prenda es obligatorio');
      return;
    }

    const tallasArray = tallasTexto
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    const coleccionFinal = seccionNueva.trim() !== '' ? seccionNueva.trim() : coleccion;
    const tipoFinal = tipoNuevo.trim() !== '' ? tipoNuevo.trim() : tipo;

    const updatedItem: InventarioItem = {
      id: product?.id || `prod-${Date.now()}`,
      sku,
      nombre,
      slug: product?.slug || nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      coleccion: coleccionFinal,
      seccion: coleccionFinal,
      tipo: tipoFinal,
      precio,
      costo,
      stock,
      estadoComercial,
      tallas: tallasArray.length > 0 ? tallasArray : ['S', 'M', 'L', 'XL'],
      descripcion,
      imagen: imagenes[0] || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop',
      imagenDorsal: imagenes[1] || undefined,
      imagenes,
      publicado,
      destacado,
    };

    onSave(updatedItem);
    toast.success(product ? 'Prenda actualizada con éxito' : 'Nueva prenda registrada en inventario', {
      description: `SKU: ${sku} • Stock total: ${Object.values(stock).reduce((a, b) => a + b, 0)} uds`,
    });
  };

  return (
    <div className="bg-[#141416] rounded-none p-6 border border-[#2A2A2A] relative flex flex-col space-y-5 shadow-2xl">
      {/* Indicador carmesí superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#dc143c] via-[#ff2d55] to-[#dc143c]"></div>

      {/* Header del Formulario */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#dc143c]/20 flex items-center justify-center text-[#dc143c]">
            <span className="material-symbols-outlined text-[18px]">edit_document</span>
          </div>
          <div>
            <span className="font-mono text-[10px] text-[#dc143c] uppercase tracking-widest block leading-none">
              {product ? 'MODAL DE EDICIÓN // ZAIREN CORE' : 'NUEVO REGISTRO // ZAIREN CORE'}
            </span>
            <h2 className="font-headline text-lg font-bold text-[#e5e2e1] uppercase mt-0.5">
              {nombre || 'NUEVA PRENDA'} <span className="text-[#dc143c] font-mono text-xs">// {sku}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-none bg-[#2a2a2a] font-mono text-[11px] text-[#ffb3b3]">
            {product ? `ID: ${product.id}` : 'NUEVO REGISTRO'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-none bg-[#2a2a2a] hover:bg-[#dc143c] text-[#e5e2e1] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Columna Izquierda: Datos Principales & Galería (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Nombre del Producto */}
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                Nombre del Producto *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Samurai Mecha Kanji // Oversized Tee"
                className="w-full bg-[#1c1b1b] text-white font-sans text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                required
              />
            </div>

            {/* SKU y Código */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  SKU / Identificador
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full bg-[#1c1b1b] text-[#dc143c] font-mono font-bold text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Tipo / Categoría
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                >
                  <option value="Polera">Polera</option>
                  <option value="Hoodie">Hoodie</option>
                  <option value="Pantalón">Pantalón</option>
                  <option value="Accesorio">Accesorio</option>
                  <option value="Gorra">Gorra</option>
                  <option value="__nuevo__">+ Crear nuevo tipo...</option>
                </select>
                {tipo === '__nuevo__' && (
                  <input
                    type="text"
                    value={tipoNuevo}
                    onChange={(e) => setTipoNuevo(e.target.value)}
                    placeholder="Escribe el nuevo tipo..."
                    className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3.5 py-2 rounded-none border border-[#dc143c] mt-1.5 focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Colección */}
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                Colección / Línea de Diseño
              </label>
              <select
                value={coleccion}
                onChange={(e) => setColeccion(e.target.value)}
                className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
              >
                <option value="Anime Mecha // Drop 01">Anime Mecha // Drop 01</option>
                <option value="Cyberpunk Tokyo // Spec">Cyberpunk Tokyo // Spec</option>
                <option value="Streetwear Zen // Core">Streetwear Zen // Core</option>
                <option value="Essentials">Essentials</option>
                <option value="__nueva__">+ Crear nueva colección...</option>
              </select>
              {coleccion === '__nueva__' && (
                <input
                  type="text"
                  value={seccionNueva}
                  onChange={(e) => setSeccionNueva(e.target.value)}
                  placeholder="Nombre de la nueva colección..."
                  className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3.5 py-2 rounded-none border border-[#dc143c] mt-1.5 focus:outline-none"
                />
              )}
            </div>

            {/* Precios y Costes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Precio Venta (Bs) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={precio}
                  onChange={(e) => setPrecio(parseFloat(e.target.value))}
                  className="w-full bg-[#1c1b1b] text-white font-price font-bold text-sm px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Costo Fabricación (Bs)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={costo}
                  onChange={(e) => setCosto(parseFloat(e.target.value))}
                  className="w-full bg-[#1c1b1b] text-[#ac8888] font-price text-sm px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                />
              </div>
            </div>

            {/* Galería de Fotos */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider">
                  Fotos de la Prenda ({imagenes.length}/5)
                </label>
                <span className="font-mono text-[10px] text-[#dc143c]">
                  ★ La 1ra es frontal, 2da dorsal
                </span>
              </div>

              {/* Botón Subir Cloudinary */}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || imagenes.length >= 5}
                  className="flex-1 py-2.5 px-4 bg-[#201f1f] hover:bg-[#2a2a2a] border border-white/[0.08] text-white font-mono text-xs uppercase rounded-none flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#dc143c]">
                    cloud_upload
                  </span>
                  <span>{isUploading ? 'Procesando WebP...' : 'Subir Imágenes'}</span>
                </button>
              </div>

              {/* Input URL Alternativo */}
              <div className="flex gap-2">
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="O ingresa URL externa..."
                  className="flex-1 bg-[#1c1b1b] text-white font-mono text-xs px-3 py-2 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-4 bg-[#201f1f] hover:bg-[#2a2a2a] text-[#FAF9F6] text-xs font-mono rounded-none border border-white/[0.08] cursor-pointer"
                >
                  + Añadir
                </button>
              </div>

              {/* Grilla Miniaturas */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                {imagenes.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-[3/4] bg-[#0E0F11] border border-white/[0.1] rounded-none overflow-hidden group"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-[#dc143c] text-white text-[9px] font-mono px-1 py-0.5 rounded-none font-bold">
                        PORTADA
                      </span>
                    )}
                    {idx === 1 && (
                      <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-mono px-1 py-0.5 rounded-none font-bold">
                        DORSAL
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          title="Hacer portada"
                          className="w-6 h-6 rounded-none bg-white/20 hover:bg-[#dc143c] text-white text-xs flex items-center justify-center cursor-pointer"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Eliminar foto"
                        className="w-6 h-6 rounded-none bg-red-600/80 hover:bg-red-600 text-white text-xs flex items-center justify-center cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Estado, Tallas, Descripción y Stock (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Estado Comercial */}
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                Estado Comercial
              </label>
              <select
                value={estadoComercial}
                onChange={(e) => setEstadoComercial(e.target.value as any)}
                className="w-full bg-[#1c1b1b] text-[#e5e2e1] font-mono text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
              >
                <option value="nuevo">NUEVO (Verde)</option>
                <option value="disponible">DISPONIBLE (Azul)</option>
                <option value="preventa">PREVENTA (Morado)</option>
                <option value="oferta">OFERTA (Ámbar)</option>
                <option value="agotado">AGOTADO (Rojo)</option>
              </select>
            </div>

            {/* Tallas Disponibles */}
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                Tallas Disponibles (Separadas por coma)
              </label>
              <input
                type="text"
                value={tallasTexto}
                onChange={(e) => setTallasTexto(e.target.value)}
                placeholder="S, M, L, XL"
                className="w-full bg-[#1c1b1b] text-[#e5e2e1] font-mono text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                required
              />
            </div>

            {/* Matriz de Stock */}
            <div>
              <MatrizStock stock={stock} onChange={setStock} />
            </div>

            {/* Descripción Corta */}
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                Descripción de la Prenda
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Detalla los aspectos clave de la prenda..."
                className="w-full bg-[#1c1b1b] text-[#e5e2e1] font-sans text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none resize-none"
              />
            </div>

            {/* Interruptor de Visibilidad */}
            <div className="flex items-center justify-between p-3 rounded-none bg-[#1c1b1b] border border-white/[0.08]">
              <div>
                <span className="text-xs font-mono font-bold text-white block">Producto Visible</span>
                <span className="text-[10px] font-mono text-[#ac8888]">¿Mostrar este producto en el catálogo?</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={publicado}
                  onChange={(e) => setPublicado(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-[#262626] border border-white/10 peer-focus:outline-none transition-colors peer peer-checked:bg-[#dc143c] peer-checked:border-[#dc143c] relative after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-5"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Acciones de Guardar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-none bg-[#201f1f] hover:bg-[#2a2a2a] text-[#ac8888] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border border-white/[0.08]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-none bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_4px_16px_rgba(220,20,60,0.4)] transition-all cursor-pointer border border-[#dc143c]"
          >
            Guardar Producto
          </button>
        </div>
      </form>
    </div>
  );
}
