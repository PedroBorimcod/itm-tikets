
import React, { useRef, useState } from "react";
import { Image, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  onImageUrl: (url: string) => void;
  currentUrl?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageUrl, currentUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const uploadImage = async (file: File) => {
    setLoading(true);
    // Faz upload do arquivo para algum serviço externo (precisa de integração real).
    // Aqui usaremos um placeholder, pois o Supabase Storage ou outro não foi solicitado no banco.
    setTimeout(() => {
      const fakeUrl = URL.createObjectURL(file);
      onImageUrl(fakeUrl); // No real, retornaria a URL depois do upload
      setLoading(false);
    }, 1200);
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-dashed flex flex-col items-center justify-center w-full h-40 transition-colors cursor-pointer bg-muted/40 relative",
        isDragging ? "border-primary bg-muted" : "border-muted"
      )}
      onDragOver={e => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={e => {
        e.preventDefault();
        setIsDragging(false);
      }}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      tabIndex={0}
      aria-label="Upload de imagem"
    >
      {loading ? (
        <span className="text-xs text-muted-foreground">Enviando imagem...</span>
      ) : currentUrl ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2">
          {/* Renderiza imagem */}
          <img
            src={currentUrl}
            alt="Pré-visualização do evento"
            className="object-cover h-24 w-36 rounded-md"
          />
          <span className="text-xs text-muted-foreground">Clique para trocar a imagem</span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="w-7 h-7 text-muted-foreground" />
          <span className="text-xs text-muted-foreground text-center">
            Arraste ou clique para selecionar<br />uma imagem do evento
          </span>
        </div>
      )}
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};
