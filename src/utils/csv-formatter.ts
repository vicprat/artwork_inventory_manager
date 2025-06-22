import { Product } from "@/types";

const CSV_HEADERS = [
  'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published',
  'Option1 Name', 'Option1 Value', 'Option2 Name', 'Option2 Value', 'Option3 Name', 'Option3 Value',
  'Variant SKU', 'Variant Grams', 'Variant Inventory Tracker', 'Variant Inventory Qty', 'Variant Inventory Policy',
  'Variant Fulfillment Service', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping',
  'Variant Taxable', 'Variant Barcode', 'Image Src', 'Image Position', 'Image Alt Text', 'Gift Card',
  'SEO Title', 'SEO Description', 'Google Shopping / Google Product Category', 'Google Shopping / Gender',
  'Google Shopping / Age Group', 'Google Shopping / MPN', 'Google Shopping / Condition', 'Google Shopping / Custom Product',
  'Variant Image', 'Variant Weight Unit', 'Variant Tax Code', 'Cost per item', 'Included / United States',
  'Price / United States', 'Compare At Price / United States', 'Included / International', 'Price / International',
  'Compare At Price / International', 'Status'
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}


export function formatDataForShopify(products: Product[]): string {
  const rows: string[][] = [];

  rows.push(CSV_HEADERS);

  products.forEach(product => {
   
    const productImages = product.images && product.images.length > 0 ? product.images : [null];

    productImages.forEach((image, index) => {
      const isFirstRow = index === 0;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row: Record<string, any> = {
        'Handle': product.handle,
        'Title': isFirstRow ? product.title : '',
        'Body (HTML)': isFirstRow ? product.body_html : '',
        'Vendor': isFirstRow ? product.vendor : '',
        'Product Category': isFirstRow ? product.product_category : '',
        'Type': isFirstRow ? product.type : '',
        'Tags': isFirstRow ? product.tags : '',
        'Published': isFirstRow ? (product.published ? 'TRUE' : 'FALSE') : '',
        'Option1 Name': isFirstRow ? product.option1_name : '',
        'Option1 Value': isFirstRow ? product.option1_value : '',
        'Option2 Name': isFirstRow ? product.option2_name : '',
        'Option2 Value': isFirstRow ? product.option2_value : '',
        'Option3 Name': isFirstRow ? product.option3_name : '',
        'Option3 Value': isFirstRow ? product.option3_value : '',
        'Variant SKU': isFirstRow ? product.variant_sku : '',
        'Variant Grams': isFirstRow ? product.variant_grams : '',
        'Variant Inventory Tracker': isFirstRow ? product.variant_inventory_tracker : '',
        'Variant Inventory Qty': isFirstRow ? product.variant_inventory_qty : '',
        'Variant Inventory Policy': isFirstRow ? product.variant_inventory_policy : '',
        'Variant Fulfillment Service': isFirstRow ? product.variant_fulfillment_service : '',
        'Variant Price': isFirstRow ? product.variantPrice : '',
        'Variant Compare At Price': isFirstRow ? product.variant_compare_at_price : '',
        'Variant Requires Shipping': isFirstRow ? (product.variant_requires_shipping ? 'TRUE' : 'FALSE') : '',
        'Variant Taxable': isFirstRow ? (product.variant_taxable ? 'TRUE' : 'FALSE') : '',
        'Variant Barcode': isFirstRow ? product.variant_barcode : '',
        'Image Src': image ? image.supabase_url : '',
        'Image Position': image ? image.position : '',
        'Image Alt Text': image ? (image.alt_text || product.title) : '',
        'Gift Card': isFirstRow ? (product.gift_card ? 'TRUE' : 'FALSE') : '',
        'SEO Title': isFirstRow ? product.seo_title : '',
        'SEO Description': isFirstRow ? product.seo_description : '',
        'Google Shopping / Google Product Category': isFirstRow ? product.google_product_category : '',
        'Google Shopping / Gender': isFirstRow ? product.google_gender : '',
        'Google Shopping / Age Group': isFirstRow ? product.google_age_group : '',
        'Google Shopping / MPN': isFirstRow ? product.google_mpn : '',
        'Google Shopping / Condition': isFirstRow ? product.google_condition : '',
        'Google Shopping / Custom Product': isFirstRow ? (product.google_custom_product ? 'TRUE' : 'FALSE') : '',
        'Variant Image': image ? image.supabase_url : '',
        'Variant Weight Unit': isFirstRow ? product.variant_weight_unit : '',
        'Variant Tax Code': isFirstRow ? product.variant_tax_code : '',
        'Cost per item': isFirstRow ? product.cost_per_item : '',
        'Included / United States': isFirstRow ? (product.included_us ? 'TRUE' : 'FALSE') : '',
        'Price / United States': isFirstRow ? product.price_us : '',
        'Compare At Price / United States': isFirstRow ? product.compare_at_price_us : '',
        'Included / International': isFirstRow ? (product.included_intl ? 'TRUE' : 'FALSE') : '',
        'Price / International': isFirstRow ? product.price_intl : '',
        'Compare At Price / International': isFirstRow ? product.compare_at_price_intl : '',
        'Status': isFirstRow ? product.status.toLowerCase() : '',
      };
      
      const orderedRow = CSV_HEADERS.map(header => escapeCsvValue(row[header]));
      rows.push(orderedRow);
    });
  });

  return rows.map(row => row.join(',')).join('\n');
}