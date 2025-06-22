/* eslint-disable @next/next/no-img-element */
import { Product } from "@/types";
import { useUploadProductImage } from "@/hooks/useProducts";
import { UploadCloudIcon } from "lucide-react";
import { useRef } from "react";

export const ImageUploader = ({ product }: { product: Product }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadProductImage();

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadImageMutation.mutate({ file, product });
  };

  return (
    <div className="relative w-full h-full group">
      <img 
        src={product.images?.[0]?.supabase_url ?? 'https://placehold.co/60x60/f0f0f0/ccc?text=?'} 
        alt={product.title} 
        className="w-full h-full object-cover rounded-md"
      />
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-md cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleIconClick}
      >
        {uploadImageMutation.isPending ? 
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> :
          <UploadCloudIcon className="text-white w-6 h-6" />
        }
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        disabled={uploadImageMutation.isPending}
      />
    </div>
  );
};