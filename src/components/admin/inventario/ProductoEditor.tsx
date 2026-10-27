import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MatrizStock, type StockBySize } from './MatrizStock';
import { uploadImageToCloudinary } from '../../../lib/imageUploader';
import { supabase } from '../../../lib/supabase';
import { MediaLibraryModal } from './MediaLibraryModal';

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
  const [precio, setPrecio] = useState<number | ''>(
    typeof product?.precio === 'number' && !Number.isNaN(product.precio) ? product.precio : 145
  );
  const [costo, setCosto] = useState<number | ''>(
    typeof product?.costo === 'number' && !Number.isNaN(product.costo) ? product.costo : 55
  );
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

  // Estados del selector modal de Mediateca Cloudinary
  interface ColeccionOpcion {
    id: string;
    nombre: string;
    slug: string;
    totalProductos?: number;
  }
  const [coleccionesDisponibles, setColeccionesDisponibles] = useState<ColeccionOpcion[]>([]);
  const [isLoadingCols, setIsLoadingCols] = useState<boolean>(false);

  const cargarColecciones = async () => {
    setIsLoadingCols(true);
    try {
      const res = await fetch('/api/admin/colecciones');
      const data = await res.json().catch(() => ({}));
      if (data.success && Array.isArray(data.colecciones)) {
        setColeccionesDisponibles(data.colecciones);
      } else {
        const { data: dbCols } = await supabase
          .from('coleccion')
          .select('id, nombre, slug')
          .order('orden', { ascending: true })
          .order('nombre', { ascending: true });
        if (dbCols) {
          setColeccionesDisponibles(dbCols.map((c: any) => ({ ...c, totalProductos: 0 })));
        }
      }
    } catch (e) {
      console.warn('Error al cargar colecciones:', e);
    } finally {
      setIsLoadingCols(false);
    }
  };

  useEffect(() => {
    cargarColecciones();
  }, []);

  const normalizarTexto = (texto: string) => {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  };

  const handleCrearColeccion = async () => {
    const nombreLimpio = seccionNueva.trim();
    if (!nombreLimpio) {
      toast.error('El nombre de la nueva colección no puede estar vacío');
      return;
    }

    const normNombre = normalizarTexto(nombreLimpio);
    const colExistente = coleccionesDisponibles.find(
      (c) => normalizarTexto(c.nombre) === normNombre || normalizarTexto(c.slug) === normNombre
    );

    if (colExistente) {
      toast.info(`La colección "${colExistente.nombre}" ya existe. Seleccionada automáticamente.`);
      setColeccion(colExistente.nombre);
      setSeccionNueva('');
      return;
    }

    const toastCreando = toast.loading('Creando nueva colección...');
    try {
      const baseSlug = normNombre.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const { data: newCol, error } = await supabase
        .from('coleccion')
        .insert({
          nombre: nombreLimpio,
          slug: finalSlug,
          activa: true,
          orden: coleccionesDisponibles.length + 1,
        })
        .select('id, nombre, slug')
        .single();

      if (error || !newCol) {
        throw error || new Error('No se pudo crear la colección');
      }

      toast.dismiss(toastCreando);
      toast.success(`Colección "${newCol.nombre}" creada y seleccionada`);

      const nuevaOpcion: ColeccionOpcion = {
        id: newCol.id,
        nombre: newCol.nombre,
        slug: newCol.slug,
        totalProductos: 0,
      };

      setColeccionesDisponibles((prev) => [...prev, nuevaOpcion]);
      setColeccion(newCol.nombre);
      setSeccionNueva('');
      window.dispatchEvent(new CustomEvent('inventory-changed'));
    } catch (err: any) {
      toast.dismiss(toastCreando);
      toast.error('Error al crear colección: ' + (err?.message || 'Error desconocido'));
    }
  };

  const [showMediaLibrary, setShowMediaLibrary] = useState<boolean>(false);
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(false);
  const [mediaImages, setMediaImages] = useState<string[]>([]);

  useEffect(() => {
    // Reiniciar estados de mediateca al alternar producto
    setShowMediaLibrary(false);
    setIsLoadingMedia(false);
    setMediaImages([]);
    setInputUrl('');

    if (product) {
      setSku(product.sku);
      setNombre(product.nombre);
      setColeccion(product.coleccion || product.seccion || 'Essentials');
      setTipo(product.tipo || 'Polera');
      setPrecio(typeof product.precio === 'number' && !Number.isNaN(product.precio) ? product.precio : 145);
      setCosto(typeof product.costo === 'number' && !Number.isNaN(product.costo) ? product.costo : 55);
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
      setStock(product.stock || { S: 0, M: 0, L: 0, XL: 0 });
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
    const toastId = toast.loading('Convirtiendo a WebP y subiendo a Cloudinary...');

    try {
      let uploadedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadImageToCloudinary(file, 'zairen/productos');
        if (res.success && res.url) {
          setImagenes((prev) => [...prev, res.url]);
          uploadedCount++;
        } else {
          toast.error(res.error || `Error al procesar ${file.name}`, { id: toastId, duration: 9000 });
          return;
        }
      }
      if (uploadedCount > 0) {
        toast.success(
          uploadedCount === 1
            ? 'Imagen convertida a .webp y guardada en Cloudinary'
            : `${uploadedCount} imágenes convertidas a .webp y guardadas`,
          { id: toastId }
        );
      }
    } catch (err: any) {
      toast.error('Error al procesar/subir imagen: ' + (err?.message || 'Error desconocido'), { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const openMediaLibrary = () => {
    setShowMediaLibrary(true);
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

  const handleDeleteProduct = async () => {
    if (!product) return;
    if (!confirm(`¿Estás seguro de retirar o eliminar "${nombre}" del catálogo?`)) return;

    const toastLoading = toast.loading('Procesando eliminación...');
    try {
      const res = await fetch('/api/admin/productos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.dismiss(toastLoading);
        if (data.error === 'REQUIERE_ARCHIVO') {
          const deseaArchivar = confirm(
            `La prenda "${nombre}" tiene ${data.pedidosAsociados} pedido(s) asociados en el historial contable.\n\nPara proteger la trazabilidad de ventas, NO puede borrarse físicamente. ¿Deseas ARCHIVARLA (desactivarla para que no aparezca en la tienda pública)?`
          );
          if (deseaArchivar) {
            const archToast = toast.loading('Archivando prenda...');
            const archRes = await fetch('/api/admin/productos', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: product.id, forzarArchivo: true }),
            });
            const archData = await archRes.json().catch(() => ({}));
            toast.dismiss(archToast);
            if (archRes.ok && archData.success) {
              toast.success(archData.message || 'Prenda archivada exitosamente.');
              onClose();
              window.dispatchEvent(new CustomEvent('inventory-changed'));
            } else {
              toast.error(archData.error || 'No se pudo archivar la prenda.');
            }
          }
          return;
        } else {
          toast.error(data.error || 'Error al procesar la eliminación.');
          return;
        }
      }

      toast.dismiss(toastLoading);
      toast.success(data.message || 'Prenda eliminada definitivamente.');
      onClose();
      window.dispatchEvent(new CustomEvent('inventory-changed'));
    } catch (err: any) {
      toast.dismiss(toastLoading);
      toast.error('Error al procesar: ' + (err?.message || 'Error de conexión'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error('El nombre de la prenda es obligatorio');
      return;
    }

    const toastLoading = toast.loading('Guardando prenda en la base de datos...');

    try {
      const tallasArray = tallasTexto
        .split(',')
        .map((t) => t.trim().toUpperCase())
        .filter(Boolean);

      const coleccionFinal = seccionNueva.trim() !== '' ? seccionNueva.trim() : coleccion;
      const tipoFinal = tipoNuevo.trim() !== '' ? tipoNuevo.trim() : tipo;

      // 1. Asegurar o crear la colección en Supabase
      let coleccionId: string | null = null;
      try {
        const { data: existingCol } = await supabase
          .from('coleccion')
          .select('id')
          .ilike('nombre', coleccionFinal)
          .maybeSingle();

        if (existingCol) {
          coleccionId = existingCol.id;
        } else {
          const colSlug = coleccionFinal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const { data: newCol, error: colErr } = await supabase
            .from('coleccion')
            .insert({
              nombre: coleccionFinal,
              slug: `${colSlug}-${Date.now().toString().slice(-4)}`,
              activa: true,
            })
            .select('id')
            .single();

          if (!colErr && newCol) {
            coleccionId = newCol.id;
          }
        }
      } catch (colErr) {
        console.warn('Coleccion error:', colErr);
      }

      if (!coleccionId) {
        const { data: firstCol } = await supabase.from('coleccion').select('id').limit(1).maybeSingle();
        if (firstCol) coleccionId = firstCol.id;
      }

      // 2. Insertar o actualizar producto
      const baseSlug = product?.slug || nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const finalSlug = product ? baseSlug : `${baseSlug}-${Date.now().toString().slice(-4)}`;

      const precioNum = typeof precio === 'number' && !Number.isNaN(precio) ? precio : (parseFloat(String(precio)) || 0);
      const costoNum = typeof costo === 'number' && !Number.isNaN(costo) ? costo : (parseFloat(String(costo)) || 0);

      const productPayload: any = {
        nombre,
        slug: finalSlug,
        descripcion,
        precio_venta: precioNum,
        stock_minimo: 4,
        activo: true,
        publicado,
        destacado,
        estado_comercial: ['preventa', 'promocion', 'oferta', 'nuevo'].includes(estadoComercial) ? estadoComercial : 'ninguno',
      };
      if (coleccionId) {
        productPayload.coleccion_id = coleccionId;
      }

      let savedProductId = product?.id;
      const isUUID = product?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);

      if (isUUID) {
        const { error: updErr } = await supabase.from('producto').update(productPayload).eq('id', savedProductId);
        if (updErr) throw updErr;
      } else {
        const { data: newP, error: insErr } = await supabase.from('producto').insert(productPayload).select('id').single();
        if (insErr) throw insErr;
        savedProductId = newP.id;
      }

      // 3. Guardar Imágenes en public.imagen
      if (savedProductId) {
        try {
          await supabase.from('imagen').delete().eq('producto_id', savedProductId);
          const validImgs = imagenes.filter(Boolean);
          if (validImgs.length > 0) {
            const imgRows = validImgs.map((url, idx) => ({
              producto_id: savedProductId,
              url_imagen: url,
              es_portada: idx === 0,
              orden: idx,
              tipo: idx === 0 ? 'frontal' : idx === 1 ? 'dorsal' : 'galeria',
            }));
            await supabase.from('imagen').insert(imgRows);
          }
        } catch (imgErr) {
          console.warn('Imagen error:', imgErr);
        }

        // 4. Guardar Tallas como atributos
        try {
          await supabase.from('atributo_producto').delete().eq('producto_id', savedProductId).eq('clave', 'talla');
          
          // Guardar como 'talla' unicamente aquellas variantes con stock positivo real
          const tallasConStockReal = Object.entries(stock)
            .filter(([_, qty]) => Number(qty) > 0)
            .map(([talla]) => talla.toUpperCase());

          const finalTallasToSave = tallasConStockReal.length > 0
            ? Array.from(new Set(tallasConStockReal))
            : tallasArray;

          if (finalTallasToSave.length > 0) {
            const attrRows = finalTallasToSave.map((talla, idx) => ({
              producto_id: savedProductId,
              clave: 'talla',
              valor: talla,
              orden: idx,
            }));
            await supabase.from('atributo_producto').insert(attrRows);
          }

          // Guardar stock específico de cada talla para eliminar el bug de XL
          await supabase.from('atributo_producto').delete().eq('producto_id', savedProductId).ilike('clave', 'stock_%');
          const stockRows = Object.entries(stock).map(([talla, qty], idx) => ({
            producto_id: savedProductId,
            clave: `stock_${talla.toUpperCase()}`,
            valor: String(Number(qty) || 0),
            orden: idx,
          }));
          if (stockRows.length > 0) {
            await supabase.from('atributo_producto').insert(stockRows);
          }
        } catch (attrErr) {
          console.warn('Atributo error:', attrErr);
        }

        // 5. Guardar inventario
        try {
          const totalStock = Object.values(stock).reduce((a, b) => a + Number(b || 0), 0);
          const { data: centralUbic } = await supabase.from('ubicacion').select('id').eq('nombre', 'CENTRAL').maybeSingle();
          if (centralUbic) {
            await supabase.from('inventario').upsert({
              producto_id: savedProductId,
              ubicacion_id: centralUbic.id,
              cantidad: totalStock,
              cantidad_reservada: 0,
            }, { onConflict: 'producto_id,ubicacion_id' });
          }
        } catch (invErr) {
          console.warn('Inventario error:', invErr);
        }
      }

      toast.dismiss(toastLoading);

      const updatedItem: InventarioItem = {
        id: savedProductId || `prod-${Date.now()}`,
        sku,
        nombre,
        slug: finalSlug,
        coleccion: coleccionFinal,
        seccion: coleccionFinal,
        tipo: tipoFinal,
        precio: precioNum,
        costo: costoNum,
        stock,
        estadoComercial,
        tallas: tallasArray.length > 0 ? tallasArray : ['S', 'M', 'L', 'XL'],
        descripcion,
        imagen: imagenes[0] || 'https://res.cloudinary.com/ds4qnoypm/image/upload/v1791690155/zairen_logo_oficial_nehjev.webp',
        imagenDorsal: imagenes[1] || undefined,
        imagenes,
        publicado,
        destacado,
      };

      onSave(updatedItem);
      fetch('/api/admin/revalidar-catalogo', { method: 'POST' })
        .then(() => toast.info('Catálogo actualizado'))
        .catch(() => {});
      toast.success(product ? 'Prenda actualizada con éxito' : 'Nueva prenda registrada en inventario', {
        description: `Colección: ${coleccionFinal} • Stock total: ${Object.values(stock).reduce((a, b) => a + Number(b || 0), 0)} uds`,
      });
      window.dispatchEvent(new CustomEvent('inventory-changed'));
    } catch (err: any) {
      toast.dismiss(toastLoading);
      toast.error('Error al guardar en Supabase: ' + (err?.message || 'Verifica la conexión'));
    }
  };

  return (
    <div className="bg-[#141416] rounded-none p-3.5 sm:p-6 border border-[#2A2A2A] relative flex flex-col space-y-5 shadow-2xl w-full max-w-full overflow-hidden">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            {/* Colección Dinámica */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block">
                  Colección / Línea de Diseño
                </label>
                <a
                  href="/admin/colecciones"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[10px] text-[#dc143c] hover:underline uppercase font-bold"
                >
                  Gestionar colecciones ↗
                </a>
              </div>
              <select
                value={coleccion}
                onChange={(e) => setColeccion(e.target.value)}
                className="w-full bg-[#1c1b1b] text-white font-mono text-xs px-3.5 py-2.5 rounded-none border border-white/[0.08] focus:border-[#dc143c] focus:outline-none"
              >
                <option value="">-- Seleccionar Colección --</option>
                {coleccionesDisponibles.map((col) => (
                  <option key={col.id} value={col.nombre}>
                    {col.nombre}
                  </option>
                ))}
                <option value="__nueva__">+ Crear nueva colección...</option>
              </select>
              {coleccion === '__nueva__' && (
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="text"
                    value={seccionNueva}
                    onChange={(e) => setSeccionNueva(e.target.value)}
                    placeholder="Nombre de la nueva colección..."
                    className="flex-1 bg-[#1c1b1b] text-white font-mono text-xs px-3.5 py-2 rounded-none border border-[#dc143c] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCrearColeccion}
                    className="px-3.5 py-2 bg-[#dc143c] hover:bg-[#ff2d55] text-white font-mono text-xs uppercase font-bold cursor-pointer transition-colors"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>

            {/* Precios y Costes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-xs text-[#ac8888] uppercase tracking-wider block mb-1">
                  Precio Venta (Bs) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={precio === '' || Number.isNaN(precio) ? '' : precio}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setPrecio('');
                    } else {
                      const num = parseFloat(val);
                      setPrecio(Number.isNaN(num) ? '' : num);
                    }
                  }}
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
                  value={costo === '' || Number.isNaN(costo) ? '' : costo}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '') {
                      setCosto('');
                    } else {
                      const num = parseFloat(val);
                      setCosto(Number.isNaN(num) ? '' : num);
                    }
                  }}
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

              {/* Botones Subir Cloudinary + Mediateca Existente */}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*"
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
                  <span>{isUploading ? 'Convirtiendo WebP...' : 'Subir Fotos (.webp)'}</span>
                </button>

                <button
                  type="button"
                  onClick={openMediaLibrary}
                  disabled={imagenes.length >= 5}
                  className="py-2.5 px-3.5 bg-[#141416] hover:bg-[#1c1b1b] border border-[#dc143c]/40 hover:border-[#dc143c] text-[#ffb3b3] hover:text-white font-mono text-xs uppercase rounded-none flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  title="Reutilizar fotos existentes de Cloudinary"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#dc143c]">
                    photo_library
                  </span>
                  <span>Mediateca</span>
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
                    key={`${img}-${idx}`}
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
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/[0.06]">
          {product ? (
            <button
              type="button"
              onClick={handleDeleteProduct}
              className="px-4 py-2.5 rounded-none bg-red-950/60 hover:bg-red-700 text-red-200 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer border border-red-800/60 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
              <span>Eliminar Prenda</span>
            </button>
          ) : <div></div>}

          <div className="flex items-center gap-3">
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
        </div>
      </form>

      {/* Modal Selector de Mediateca Cloudinary */}
      <MediaLibraryModal
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        alreadySelectedUrls={imagenes}
        onSelectImages={(selectedUrls) => {
          setImagenes((prev) => {
            const combined = [...prev, ...selectedUrls];
            return combined.slice(0, 5);
          });
        }}
        maxSelection={5}
      />
    </div>
  );
}
