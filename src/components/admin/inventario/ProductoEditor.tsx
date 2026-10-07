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

  // Manejador de subida directa a Cloudinary con auto-WebP
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imagenes.length + files.length > 5) {
      toast.error('Máximo 5 imágenes por producto');
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading('Comprimiendo a WebP y subiendo a Cloudinary...');

    try {
      const uploadPromises = Array.from(files).map((file) => uploadImageToCloudinary(file));
      const results = await Promise.all(uploadPromises);

      const newUrls = results.map((r) => r.secureUrl);
      setImagenes((prev) => [...prev, ...newUrls].slice(0, 5));

      toast.success(`${results.length} imagen(es) optimizadas y subidas con éxito`, { id: toastId });
    } catch (err: any) {
      console.error('Error subiendo imagen:', err);
      toast.error(`Error al subir imagen: ${err.message || 'Verifica la conexión'}`, { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Añadir imagen por URL manual
  const handleAddUrl = () => {
    if (!inputUrl.trim()) return;
    if (imagenes.length >= 5) {
      toast.error('Máximo 5 imágenes por producto');
      return;
    }
    if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
      toast.error('La URL debe comenzar con http:// o https://');
      return;
    }
    setImagenes((prev) => [...prev, inputUrl.trim()]);
    setInputUrl('');
    toast.success('Imagen añadida a la galería');
  };

  // Eliminar imagen de la galería
  const handleRemoveImage = (index: number) => {
    setImagenes((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Mover imagen a la primera posición (Principal)
  const handleSetMainImage = (index: number) => {
    if (index === 0) return;
    setImagenes((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    toast.info('Imagen establecida como portada principal');
  };

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

    const finalColeccion = coleccion === 'nueva' ? seccionNueva.trim() || 'General' : coleccion;
    const finalTipo = tipo === 'otro' ? tipoNuevo.trim() || 'Prenda' : tipo;

    const parsedTallas = tallasTexto
      .split(',')
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean);

    const mainImage = imagenes[0] || 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop';
    const dorsalImage = imagenes[1] || '';

    const updatedItem: InventarioItem = {
      id: product?.id || `prod-${Date.now()}`,
      sku,
      nombre,
      slug,
      coleccion: finalColeccion,
      seccion: finalColeccion,
      tipo: finalTipo,
      precio: Number(precio) || 0,
      costo: Number(costo) || 0,
      stock,
      imagen: mainImage,
      imagenDorsal: dorsalImage,
      imagenes,
      estadoComercial,
      tallas: parsedTallas.length > 0 ? parsedTallas : ['S', 'M', 'L', 'XL'],
      descripcion,
      publicado,
      destacado,
    };

    onSave(updatedItem);
    toast.success(product ? 'Prenda actualizada con éxito' : 'Nueva prenda registrada en inventario', {
      description: `SKU: ${sku} • Stock total: ${Object.values(stock).reduce((a, b) => a + b, 0)} uds`,
    });
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
              {product ? 'EDITANDO ARTÍCULO // CATALOGO V0' : 'AGREGAR ARTÍCULO // CATALOGO V0'}
            </span>
            <h2 className="font-headline text-lg font-bold text-[#e5e2e1] uppercase mt-0.5">
              {nombre || 'NUEVA PRENDA'} <span className="text-[#dc143c] font-mono text-xs">// {sku}</span>
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
          {/* Columna Izquierda: Datos Principales & Galería Cloudinary (7 cols) */}
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
                placeholder="Ej: ZR-01 Core Tee"
                className="w-full bg-[#141416] text-[#e5e2e1] font-sans text-sm px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                required
              />
            </div>

            {/* Precio & SKU */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Precio (Bs) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[#dc143c] font-bold">
                    Bs
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    value={precio}
                    onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs pl-9 pr-3 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Código SKU
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="ZR-01"
                  className="w-full bg-[#141416] text-[#ffb3b3] font-mono text-xs uppercase px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Sección / Colección & Tipo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Sección / Colección
                </label>
                <select
                  value={coleccion}
                  onChange={(e) => setColeccion(e.target.value)}
                  className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                >
                  <option value="Essentials">Essentials</option>
                  <option value="Anime">Anime</option>
                  <option value="Películas">Películas</option>
                  <option value="Tokyo Archive">Tokyo Archive</option>
                  <option value="nueva">Otra (Nueva Sección)...</option>
                </select>
                {coleccion === 'nueva' && (
                  <input
                    type="text"
                    value={seccionNueva}
                    onChange={(e) => setSeccionNueva(e.target.value)}
                    placeholder="Nombre de la nueva sección"
                    className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none mt-2"
                  />
                )}
              </div>

              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Tipo de Producto
                </label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                >
                  <option value="Polera">Polera</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Servicio">Servicio</option>
                  <option value="Zapatillas">Zapatillas</option>
                  <option value="Figuras">Figuras</option>
                  <option value="otro">Otro (Nuevo Tipo)...</option>
                </select>
                {tipo === 'otro' && (
                  <input
                    type="text"
                    value={tipoNuevo}
                    onChange={(e) => setTipoNuevo(e.target.value)}
                    placeholder="Nombre del nuevo tipo"
                    className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none mt-2"
                  />
                )}
              </div>
            </div>

            {/* ======================================================== */}
            {/* ZONA DE CARGA AUTOMÁTICA CLOUDINARY (1-5 FOTOS WEBP)     */}
            {/* ======================================================== */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider">
                  Imágenes del Producto (Máximo 5 - La primera será la Principal)
                </label>
                <span className="font-mono text-[10px] text-[#dc143c]">
                  {imagenes.length}/5 CARGADAS
                </span>
              </div>

              {/* Botón de subida local directa */}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || imagenes.length >= 5}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#201f1f] hover:bg-[#2a2a2a] text-[#FAF9F6] border border-white/[0.1] font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#dc143c]">cloud_upload</span>
                  <span>{isUploading ? 'Subiendo a Cloudinary...' : 'Subir Fotos (Auto-WebP)'}</span>
                </button>
              </div>

              {/* Input para añadir URL directa si se desea */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="O pega una URL: https://..."
                  className="flex-1 bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3 py-2 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-2 rounded-xl bg-[#201f1f] hover:bg-[#dc143c] text-white border border-white/[0.1] text-xs font-mono transition-colors cursor-pointer"
                  title="Añadir URL"
                >
                  +
                </button>
              </div>

              {/* Contenedor de Miniaturas de Galería */}
              <div className="grid grid-cols-5 gap-2.5 p-3 rounded-xl border border-dashed border-white/[0.1] bg-[#141416]/50 min-h-[90px] items-center">
                {imagenes.length === 0 ? (
                  <div className="col-span-5 text-center text-xs font-mono text-[#737373] py-4">
                    Sin imágenes cargadas aún. Selecciona hasta 5 fotos.
                  </div>
                ) : (
                  imagenes.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-[4/5] rounded-lg overflow-hidden border border-white/[0.15] bg-[#0e0e0e]"
                    >
                      <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-[#dc143c] text-white font-mono text-[8px] font-bold px-1 py-0.5 rounded shadow">
                          PRINCIPAL
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(idx)}
                            title="Hacer principal"
                            className="w-6 h-6 rounded-full bg-white/20 hover:bg-[#dc143c] text-white text-xs flex items-center justify-center"
                          >
                            ★
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          title="Eliminar foto"
                          className="w-6 h-6 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-xs flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Estado, Tallas, Descripción y Visibilidad (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            {/* Estado Inicial */}
            <div>
              <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                Estado Comercial
              </label>
              <select
                value={estadoComercial}
                onChange={(e) => setEstadoComercial(e.target.value as any)}
                className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
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
                className="w-full bg-[#141416] text-[#e5e2e1] font-mono text-xs px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
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
                Descripción del Producto
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                placeholder="Detalla los aspectos clave de la prenda..."
                className="w-full bg-[#141416] text-[#e5e2e1] font-sans text-xs px-3.5 py-2.5 rounded-xl border border-white/[0.08] focus:border-[#dc143c] focus:outline-none resize-none"
              />
            </div>

            {/* Interruptor de Visibilidad */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#141416] border border-white/[0.08]">
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
                <div className="w-10 h-5 bg-[#2a2a2a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#dc143c]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Acciones de Guardar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#201f1f] hover:bg-[#2a2a2a] text-[#ac8888] hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-full bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase tracking-wider font-bold shadow-[0_4px_16px_rgba(220,20,60,0.4)] transition-all cursor-pointer"
          >
            Guardar Producto
          </button>
        </div>
      </form>
    </div>
  );
}
