
import React, { useRef, useState } from "react";
import { Image, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface ImageDropzoneProps {
  onImageUrl: (url: string) => void;
  currentUrl?: string;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({ onImageUrl, currentUrl }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gera URL pública de um arquivo do Supabase Storage
  const getPublicUrl = (filePath: string) => {
    const { data } = supabase.storage.from("event-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const uploadImage = async (file: File) => {
    setLoading(true);
    try {
      // Usa um nome único para cada upload
      const filename = `${uuidv4()}-${file.name.replace(/\s/g, "_")}`;
      // Faz upload para o bucket
      const { error } = await supabase.storage.from("event-images").upload(filename, file, {
        cacheControl: "3600",
        upsert: false
      });
      if (error) throw error;
      // Gera a url pública
      const publicUrl = getPublicUrl(filename);
      onImageUrl(publicUrl);
    } catch (err) {
      alert("Erro ao enviar imagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

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
