# Imágenes provisionales de productos

Ilustraciones planas (1000 × 1000 px) para los productos sin foto. Son provisionales: cambiarlas por fotos reales cuando las haya.

- `gen.py`: dibuja una por producto (SVG → PNG con `qlmanage`, de macOS). Para un producto nuevo, añade su handle a `SPEC` (forma, color, subtítulo). Lee `products.json` (consulta `products { id title handle productType tags }`).
- `upload.py`: sube `out/<handle>.svg.png` a cada producto **sin imagen**, con `shopify store execute`. Antes hay que autorizar una vez:
  `shopify store auth -s brudabrey.myshopify.com --scopes read_products,write_products,write_files`
- `muestra.png`: hoja con las imágenes subidas el 23/11/2026 (42 productos).
