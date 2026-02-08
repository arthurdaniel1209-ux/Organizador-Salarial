
import React, { useState } from 'react';
import { CloseIcon } from './icons';

interface IconPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIcon: (icon: string) => void;
  icons: string[];
}

const IconPickerModal: React.FC<IconPickerModalProps> = ({ isOpen, onClose, onSelectIcon, icons }) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    if (selectedIcon) {
      onSelectIcon(selectedIcon);
      setSelectedIcon(null);
    }
  };

  const handleClose = () => {
    setSelectedIcon(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative border border-gray-200">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
          <CloseIcon />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-gray-800">Selecione um Ícone</h3>
        
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-4 max-h-64 overflow-y-auto pr-2">
          {icons.map((icon, index) => (
            <button 
              key={index} 
              onClick={() => setSelectedIcon(icon)}
              className={`flex items-center justify-center text-xl p-3 rounded-md transition-all duration-200 ${selectedIcon === icon ? 'bg-blue-500 text-white ring-2 ring-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <span dangerouslySetInnerHTML={{ __html: icon }} />
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedIcon} 
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;
