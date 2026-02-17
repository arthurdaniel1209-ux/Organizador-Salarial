
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 w-full max-w-lg relative transition-all transform scale-95 opacity-0 animate-scale-in" style={{animation: 'scaleIn 0.3s ease-out forwards'}}>
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <CloseIcon />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Selecione um Ícone</h3>
        
        <div className="grid grid-cols-6 sm:grid-cols-8 gap-4 max-h-64 overflow-y-auto pr-2">
          {icons.map((icon, index) => (
            <button 
              key={index} 
              onClick={() => setSelectedIcon(icon)}
              className={`flex items-center justify-center text-2xl p-3 rounded-xl transition-all duration-200 ${selectedIcon === icon ? 'bg-blue-500 text-white ring-4 ring-blue-300 dark:ring-blue-500/50' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
            >
              <span dangerouslySetInnerHTML={{ __html: icon }} />
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={handleClose} className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all duration-300">
            Cancelar
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedIcon} 
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:opacity-90 transition-all duration-300 transform hover:scale-105 disabled:bg-blue-300 disabled:cursor-not-allowed disabled:scale-100"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default IconPickerModal;
