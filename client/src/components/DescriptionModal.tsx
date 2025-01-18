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
  modalClassName?: string;
  noTripsFallback?: React.ReactNode; // New prop to handle fallback when no trips are available
}

const DescriptionModal: React.FC<DescriptionModalProps> = ({
  isOpen,
  trips,
  selectedTripId,
  onTripChange,
  onConfirm,
  onCancel,
  noTripsFallback, // Destructure the new prop
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 text-black dark:text-gray-100 w-full max-w-md p-6 rounded-md shadow-lg relative">
        <h2 className="text-xl font-bold mb-4">Select a Trip</h2>

        {trips.length === 0 ? (
          noTripsFallback || (
            <p className="text-gray-500 dark:text-gray-300">You have no trips yet.</p>
          )
        ) : (
          <select
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white"
            value={selectedTripId}
            onChange={(e) => onTripChange(e.target.value)}
          >
            <option value="">-- Choose a trip --</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center justify-end mt-6 gap-4">
          <button
            onClick={onCancel}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-cyan-700 hover:bg-cyan-600 text-white"
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
