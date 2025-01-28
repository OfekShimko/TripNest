import { useEffect, useState } from 'react';

interface Collaborator {
  user_id: string;
  user_name: string;
  permission_level: string;
  user_email: string;
}

const CollaboratorsList = ({ tripId }: { tripId: string }) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollaborators = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/trips/${tripId}/permissions`);

        if (!response.ok) {
          throw new Error('Failed to load collaborators');
        }

        const data = await response.json();
        setCollaborators(data.message);
      } catch (err) {
        setError('Failed to load collaborators.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollaborators();
  }, [tripId]);

  if (loading) {
    return <p className="text-black dark:text-white">Loading collaborators...</p>;
  }

  if (error) {
    return <p className="text-red-600 dark:text-red-400">{error}</p>;
  }


  const currentUserId = localStorage.getItem('userId');


  const sortedCollaborators = [...collaborators].sort((a, b) => {
    if (a.user_id === currentUserId) return -1;
    if (b.user_id === currentUserId) return 1;
    return 0;
  });

  return (

    <div className="bg-cyan-100 dark:bg-cyan-900 text-black dark:text-white p-6 rounded-lg shadow-md text-center md:text-left flex flex-col h-full">
      <h3 className="text-xl font-bold mb-4">Collaborators</h3>
      <div className="overflow-y-auto max-h-32">
        {sortedCollaborators.length > 0 ? (
          sortedCollaborators.map((collaborator) => (
            <div key={collaborator.user_id} className="p-2">
              <p
                className={`font-semibold text-lg mb-1 ${
                  collaborator.user_id === currentUserId
                    ? 'text-teal-600 dark:text-teal-400 font-bold'
                    : 'text-gray-800 dark:text-gray-200'
                }`}
              >
                {collaborator.user_name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Role: {collaborator.permission_level}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-700 dark:text-gray-300">No collaborators found.</p>
        )}
      </div>
    </div>
  );
};

export default CollaboratorsList;
