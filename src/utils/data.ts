import { Product } from "@/types";

import { artistOptions, materialKeywordTags, typeOptions } from "@/lib/constants";

const normalizeString = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .normalize("NFD") // Separa los acentos de las letras
        .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
        .toLowerCase() // Convierte a minúsculas
        .trim(); // Quita espacios al inicio y al final
};

const directValueTags = [
    ...artistOptions.map(o => o.value),
    ...typeOptions.map(o => o.value)
];


const valueBasedTagSet = new Set([
    ...directValueTags,
    ...materialKeywordTags
].map(normalizeString));

const structuralTagPatterns = [
  /^locacion-/,    
  /^Formato (Grande|Mediano|Pequeño|Miniatura)$/, 
  /^Disponible$/,     
  /^\d{4}$/,        
];

export const isAutoTag = (tag: string): boolean => {
  const trimmedTag = tag.trim();
  const normalizedTag = normalizeString(trimmedTag);

  // 1. ¿El tag normalizado existe en nuestro set de valores automáticos?
  if (valueBasedTagSet.has(normalizedTag)) {
    return true;
  }
  
  // 2. ¿El tag original coincide con algún patrón estructural?
  if (structuralTagPatterns.some(pattern => pattern.test(trimmedTag))) {
    return true;
  }

  return false;
};


export const parseTags = (tagsString: string | null | undefined): { autoTags: string[], manualTags: string[] } => {
  if (!tagsString) {
    return { autoTags: [], manualTags: [] };
  }
  const allTags = tagsString.split(',').map(t => t.trim()).filter(Boolean);
  const autoTags = allTags.filter(isAutoTag);
  const manualTags = allTags.filter(t => !isAutoTag(t));
  return { autoTags, manualTags };
};



export const generateDescription = (product: Product): string => {
    const parts: string[] = [];
    const existingHtml = product.body_html || '';
    const descriptionPart = existingHtml.split('<ul>')[0].trim();
    if (descriptionPart && !descriptionPart.startsWith('<')) parts.push(`<p>${descriptionPart}</p>`);
    else if(descriptionPart) parts.push(descriptionPart);

    const details: string[] = [];
    if (product.vendor) details.push(`<strong>Artista:</strong> ${product.vendor}`);
    if (product.artwork_medium) details.push(`<strong>Técnica:</strong> ${product.artwork_medium}`);
    if (product.type) details.push(`<strong>Tipo:</strong> ${product.type}`);
    const dimensions = [product.artwork_height, product.artwork_width, product.artwork_depth]
        .filter(Boolean)
        .map((dim, i) => `${dim}${['h', 'w', 'd'][i]}`)
        .join(' x ');
    if (dimensions) details.push(`<strong>Medidas:</strong> ${dimensions}`);
    if (product.artwork_year) details.push(`<strong>Año:</strong> ${product.artwork_year}`);
    if (product.artworkLocation) details.push(`<strong>Localización:</strong> ${product.artworkLocation}`);
    if (details.length > 0) parts.push(`<ul>${details.map(d => `<li>${d}</li>`).join('')}</ul>`);
    return parts.join('\n');
};

export const generateTags = (product: Product, manualTagsFromInput: string[] = []): string => {
    const autoTags = new Set<string>();

    if (product.vendor) autoTags.add(product.vendor.trim());
    if (product.type) autoTags.add(product.type.trim());

    const fullText = normalizeString(`${product.artwork_medium || ''} ${product.type || ''}`);
    const materialKeywords: Record<string, string> = { 
        'oleo': 'Óleo', 'acrilico': 'Acrílico', 'mixta': 'Técnica Mixta', 'collage': 'Collage', 
        'tela': 'Tela', 'canvas': 'Tela', 'lienzo': 'Tela', 'papel': 'Papel', 'madera': 'Madera', 
        'metal': 'Metal', 'bronce': 'Bronce', 'grabado': 'Grabado', 'fotografia': 'Fotografía',
        'tinta': 'Tinta', 'acuarela': 'Acuarela', 'carboncillo': 'Carboncillo', 'grafito': 'Grafito',
        'lapiz': 'Lápiz', 'pastel': 'Pastel', 'piedra': 'Piedra', 'litografia': 'Litografía'
    };
    Object.entries(materialKeywords).forEach(([keyword, tag]) => {
      if (fullText.includes(keyword)) autoTags.add(tag);
    });
    
    const height = parseFloat(product.artwork_height || '0');
    const width = parseFloat(product.artwork_width || '0');
    if (!isNaN(height) && height > 0) {
        if (height >= 150 || width >= 150) autoTags.add('Formato Grande');
        else if (height >= 100 || width >= 100) autoTags.add('Formato Mediano');
        else if (height >= 50 || width >= 50) autoTags.add('Formato Pequeño');
        else autoTags.add('Formato Miniatura');
    }
    if (product.artworkLocation) {
        const locationHandle = product.artworkLocation.trim().toLowerCase().replace(/\s+/g, '-');
        if (locationHandle) autoTags.add(`locacion-${locationHandle}`);
    }
    if (product.artwork_year) { 
        const year = String(product.artwork_year).match(/\d{4}/); 
        if (year) autoTags.add(year[0]); 
    }
    if (product.status === "ACTIVE") autoTags.add('Disponible');
    
    const cleanManualTags = manualTagsFromInput.filter(tag => !isAutoTag(tag));

    const combinedTags = new Set([...cleanManualTags, ...Array.from(autoTags)]);
    return Array.from(combinedTags).filter(Boolean).join(', ');
};