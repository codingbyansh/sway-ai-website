import React, { useRef } from 'react';
import { InputMode } from '../types';
import { Upload, X, Image as ImageIcon, FileText } from 'lucide-react';

interface InputSectionProps {
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  imageInput: string | null;
  setImageInput: (image: string | null) => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  mode,
  setMode,
  textInput,
  setTextInput,
  imageInput,
  setImageInput,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageInput(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageInput(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id="tour-input-section" className="w-full space-y-4">
      {/* Input Mode Selector */}
      <div className="flex bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-gray-100 dark:border-white/5">
        <button
          type="button"
          onClick={() => setMode(InputMode.TEXT)}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === InputMode.TEXT
              ? 'bg-white dark:bg-[#1e1e2d] text-pink-600 dark:text-pink-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileText size={14} />
          <span>Text Message</span>
        </button>
        <button
          type="button"
          onClick={() => setMode(InputMode.IMAGE)}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === InputMode.IMAGE
              ? 'bg-white dark:bg-[#1e1e2d] text-pink-600 dark:text-pink-400 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <ImageIcon size={14} />
          <span>Upload Screenshot</span>
        </button>
      </div>

      {/* Inputs */}
      {mode === InputMode.TEXT ? (
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Paste the message from your chat here..."
          className="w-full h-36 p-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-white dark:bg-[#12121a] focus:border-pink-300 focus:ring-4 focus:ring-pink-50 outline-none transition-all placeholder:text-gray-300 text-gray-700 dark:text-gray-100 dark:bg-[#1a1a24] text-sm shadow-inner resize-none"
        />
      ) : (
        <div className="space-y-3">
          {imageInput ? (
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#12121a] p-2 flex items-center justify-center min-h-[144px]">
              <img
                src={imageInput}
                alt="Chat screenshot preview"
                className="max-h-36 object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-pink-400 dark:hover:border-pink-500 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors bg-white dark:bg-[#12121a] group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="p-3 bg-pink-50 dark:bg-pink-950/20 rounded-full text-pink-500 mb-2 group-hover:scale-105 transition-transform">
                <Upload size={20} />
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Click to upload screenshot
              </span>
              <span className="text-[10px] text-gray-400 mt-1">
                PNG, JPG or JPEG (Dating app chats)
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InputSection;