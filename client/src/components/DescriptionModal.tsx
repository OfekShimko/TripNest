// src/components/SelectTripModal.tsx
import React from 'react';

type Trip = {
  id: string;
  title: string;
};

interface DescriptionModalProps {
  isOpen: boolean;
  trips: Trip[];
  selectedTripId: string;
  onTripChange: (tripId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({
  isOpen,
  trips,
  selectedTripId,
  onTripChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null; // If modal is closed, render nothing

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50'>
      <div className='bg-white w-full max-w-md p-6 rounded-md shadow-lg relative'>
        <h2 className='text-xl font-bold mb-4'>Select a Trip</h2>

        {trips.length === 0 ? (
          <p>You have no trips yet.</p>
        ) : (
          <select
            className='w-full p-2 border border-gray-300 rounded-lg'
            value={selectedTripId}
            onChange={(e) => onTripChange(e.target.value)}
          >
            <option value=''>-- Choose a trip --</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}

        <div className='flex items-center justify-end mt-6 gap-4'>
          <button onClick={onCancel} className='text-gray-600 hover:text-gray-800'>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg'
            disabled={!selectedTripId}
          >
            Confirm Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionModal;
