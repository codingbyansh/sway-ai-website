import React from 'react';
import { InputMode } from '../types';

interface InputSectionProps {
  mode: InputMode;
  setMode: (mode: InputMode) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  imageInput: string | null;
  setImageInput: (image: string | null) => void;
}

const InputSection: React.FC<InputSectionProps> = ({ textInput, setTextInput }) => {
  return (
    <div id="tour-input-section" className="w-full">
      <textarea
        value={textInput}
        onChange={(e) => setTextInput(e.target.value)}
        placeholder="Paste the message here..."
        className="w-full h-36 p-4 rounded-2xl border-2 border-gray-100 dark:border-white/5 bg-white dark:bg-[#12121a] focus:border-pink-300 focus:ring-4 focus:ring-pink-50 outline-none transition-all placeholder:text-gray-300 text-gray-700 dark:text-gray-200 dark:text-gray-100 dark:bg-[#1a1a24] text-base shadow-inner resize-none"
      />
    </div>
  );
};

export default InputSection;