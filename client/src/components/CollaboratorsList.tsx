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
        return <p>Loading collaborators...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    // Get the current user's ID from localStorage
    const currentUserId = localStorage.getItem('userId');

    // Sort the collaborators to show the current user first
    const sortedCollaborators = [...collaborators].sort((a, b) => {
        if (a.user_id === currentUserId) return -1; // Current user comes first
        if (b.user_id === currentUserId) return 1;  // Current user comes first
        return 0; // Otherwise, no change in order
    });

    return (
        <div className="bg-cyan-100 p-6 rounded-lg shadow-md text-center md:text-left flex flex-col h-full">
            <h3 className="text-xl font-bold mb-4">Collaborators</h3>
            <div className="overflow-y-auto max-h-32">
                {sortedCollaborators.length > 0 ? (
                    sortedCollaborators.map((collaborator) => (
                        <div
                            key={collaborator.user_id}
                            className="p-2"
                        >
                            <p
                                className={`font-semibold text-lg ${
                                    collaborator.user_id === currentUserId
                                        ? 'text-teal-600 font-bold' // Make current user distinct
                                        : 'text-gray-800'
                                } mb-1`}
                            >
                                {collaborator.user_name}
                            </p>
                            <p className="text-sm text-gray-600">Role: {collaborator.permission_level}</p>
                        </div>
                    ))
                ) : (
                    <p>No collaborators found.</p>
                )}
            </div>
        </div>
    );
};

export default CollaboratorsList;
