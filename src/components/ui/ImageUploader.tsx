import { Camera, ImagePlus } from 'lucide-react';
import { useImageUpload } from '../../hooks';

interface ImageUploaderProps {
  value: string;
  onChange: (dataUrl: string) => void;
  variant?: 'avatar' | 'product';
  placeholder?: React.ReactNode;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  variant = 'product',
  placeholder,
  className = '',
}: ImageUploaderProps) {
  const { inputRef, openPicker, handleChange, accept } = useImageUpload({
    onUpload: onChange,
  });

  const isAvatar = variant === 'avatar';

  const containerClasses = isAvatar
    ? 'relative w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-primary-300 hover:border-primary-400 transition-colors'
    : 'relative h-48 bg-primary-100 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-primary-300 hover:border-primary-400 transition-colors';

  const defaultPlaceholder = isAvatar ? (
    <Camera className="text-primary-400" size={32} />
  ) : (
    <div className="text-center text-primary-400">
      <ImagePlus size={32} className="mx-auto mb-1" />
      <span className="text-sm">사진 추가</span>
    </div>
  );

  return (
    <>
      <div onClick={openPicker} className={`${containerClasses} ${className}`}>
        {value ? (
          <>
            <img
              src={value}
              alt="업로드 이미지"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </>
        ) : (
          placeholder || defaultPlaceholder
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </>
  );
}
