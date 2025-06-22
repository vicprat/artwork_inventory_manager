export type ProductStatus = 'ACTIVE' | 'DRAFT';
export type DuplicateResolution = 'PENDING' | 'RESOLVED' | 'IGNORED';
export type SourceType = 'SHOPIFY' | 'WOOCOMMERCE' | 'MANUAL';

export type ProductImage = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  product_id: string;
  original_url: string;
  supabase_url: string;
  supabase_path?: string;
  position: number;
  alt_text?: string;
  width?: number;
  height?: number;
  file_size?: number;
  format?: string;
  processed: boolean;
  processed_at?: Date;
}

export type Product  = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  handle: string;
  title: string;
  body_html?: string;
  vendor?: string;
  product_category?: string;
  type?: string;
  tags?: string;
  published: boolean;
  status: ProductStatus;
  seo_title?: string;
  seo_description?: string;
  variant_sku?: string;
  variantPrice: number;
  variant_compare_at_price?: number;
  variant_grams?: number;
  variant_inventory_tracker?: string;
  variant_inventory_qty?: number;
  variant_inventory_policy?: string;
  variant_fulfillment_service?: string;
  variant_requires_shipping?: boolean;
  variant_taxable?: boolean;
  variant_barcode?: string;
  variant_weight_unit?: string;
  variant_tax_code?: string;
  cost_per_item?: number;
  option1_name?: string;
  option1_value?: string;
  option2_name?: string;
  option2_value?: string;
  option3_name?: string;
  option3_value?: string;
  google_product_category?: string;
  google_gender?: string;
  google_age_group?: string;
  google_mpn?: string;
  google_condition?: string;
  google_custom_product?: string;
  gift_card: boolean;
  included_us?: boolean;
  price_us?: number;
  compare_at_price_us?: number;
  included_intl?: boolean;
  price_intl?: number;
  compare_at_price_intl?: number;
  sourceType: SourceType;
  source_id?: string;
  artwork_artist?: string;
  artwork_medium?: string;
  artwork_height?: string;
  artwork_width?: string;
  artwork_depth?: string;
  artwork_year?: string;
  artwork_status?: string;
  artworkLocation?: string;
  images?: ProductImage[];
  product_images?: ProductImage[];
  serie?: string;
  profundidad?: string;
}


export type Option = {
  id: string;
  name: string;
}
