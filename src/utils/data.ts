import { Product } from "@/app/types";

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

export const generateTags = (product: Product): string => {
    const tags = new Set<string>();
    if (product.vendor && product.vendor.trim() !== 'Impulso Galeria') tags.add(product.vendor.trim());
    const fullText = `${product.artwork_medium || ''} ${product.type || ''}`.toLowerCase();
    const materialKeywords: Record<string, string> = { 
        'óleo': 'Óleo', 
        'acrílico': 'Acrílico', 
        'mixta': 'Técnica Mixta', 
        'collage': 'Collage', 
        'tela': 'Tela', 
        'canvas': 'Tela', 
        'lienzo': 'Tela', 
        'papel': 'Papel', 
        'madera': 'Madera', 
        'metal': 'Metal', 
        'bronce': 'Bronce', 
        'grabado': 'Grabado', 
        'fotografía': 'Fotografía' 
    };
    Object.entries(materialKeywords).forEach(([keyword, tag]) => { if (fullText.includes(keyword)) tags.add(tag); });
    const height = parseFloat(product.artwork_height || '0');
    const width = parseFloat(product.artwork_width || '0');
    if (!isNaN(height) && height > 0) {
        if (height >= 150 || width >= 150) tags.add('Formato Grande');
        else if (height >= 100 || width >= 100) tags.add('Formato Mediano');
        else if (height >= 50 || width >= 50) tags.add('Formato Pequeño');
        else tags.add('Formato Miniatura');
    }
    if (product.artworkLocation) {
        const locationHandle = product.artworkLocation.trim().toLowerCase().replace(/\s+/g, '-');
        if (locationHandle) tags.add(`locacion-${locationHandle}`);
    }
    if (product.artwork_year) { 
        const year = String(product.artwork_year).match(/\d{4}/); 
        if (year) tags.add(year[0]); 
    }
    if (product.status === "ACTIVE") tags.add('Disponible');
    const existingTags = product.tags ? String(product.tags).split(',').map(t => t.trim()) : [];
    const manualTags = existingTags.filter(t => !/^(locacion-|Formato|Disponible|\d{4}|Óleo|Acrílico|Tela|Papel|Madera|Metal|Bronce|Grabado|Fotografía|Técnica Mixta|Collage)/i.test(t));
    const newTags = new Set([...manualTags, ...Array.from(tags)]);
    return Array.from(newTags).filter(Boolean).join(', ');
};
