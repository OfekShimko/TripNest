import { useState } from "react";
import { toast } from "react-toastify";

type UserSearchModalProps = {
  tripId: string;
  onClose: () => void;
};

const UserSearchModal = ({ tripId, onClose }: UserSearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState("Viewer");
  const id = localStorage.getItem("userId");

  // Handle search click
  const handleSearch = async () => {
    if (!searchQuery) {
      toast.error("Please enter an email to search");
      return;
    }

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/search-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: searchQuery }),
      });

      const data = await res.json();
      console.log("Fetched users:", data);

      if (res.ok && data.user) {
        setUsers([{ ...data.user, permission: data.permission }]); // Store permission with user
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Error searching users.");
      setUsers([]);
    }
  };

  // Add user to trip
  const handleAddUser = async (userId: string) => {
    const userEmail = users.find((user) => user.id === userId)?.email;

    if (!userEmail) {
      toast.error("User email is missing or invalid");
      return;
    }

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/add-permission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          permission: role,
          user_id: id,
        }),
      });

      if (res.ok) {
        toast.success("User added successfully!");
        onClose();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to add user.");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("An error occurred while adding the user.");
    }
  };

  // Change user permission (to either "Editor" or "Viewer")
  const handleChangePermission = async (userId: string) => {
    const userEmail = users.find((user) => user.id === userId)?.email;

    if (!userEmail) {
      toast.error("User email is missing or invalid");
      return;
    }

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/change-permission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          new_permission: role,
          user_id: id,
        }),
      });

      if (res.ok) {
        toast.success("User permission updated successfully!");
        onClose();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to update permission.");
      }
    } catch (error) {
      console.error("Error changing permission:", error);
      toast.error("An error occurred while changing permission.");
    }
  };

  // Delete user permission
  const handleDeletePermission = async (userId: string) => {
    const userEmail = users.find((user) => user.id === userId)?.email;

    if (!userEmail) {
      toast.error("User email is missing or invalid");
      return;
    }

    try {
      const res = await fetch(`/api/v1/trips/${tripId}/delete-permission`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          user_id: id,
        }),
      });

      if (res.ok) {
        toast.success("User permission deleted successfully!");
        onClose();
      } else {
        const errorData = await res.json();
        toast.error(errorData.message || "Failed to delete permission.");
      }
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("An error occurred while deleting permission.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-128 p-6">
        <h3 className="text-xl font-bold mb-4">Manage User Permissions</h3>

        {/* Input for searching by email */}
        <div className="flex mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by user email..."
            className="w-full p-2 border rounded-md"
          />
          <button
            onClick={handleSearch}
            className="ml-2 p-2 bg-blue-600 text-white rounded-md"
          >
            Search
          </button>
        </div>

        {/* Dropdown for selecting roles */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 border rounded-md mb-4"
        >
          <option value="Viewer">Viewer</option>
          <option value="Editor">Editor</option>
        </select>

        {/* Users list */}
        {Array.isArray(users) && users.length > 0 ? (
          <div className="max-h-64 overflow-y-auto mb-4">
            {users.map((user: any) => (
              <div key={user.id} className="flex justify-between items-center mb-2 p-2 border-b">
                <p className="text-sm">
                  {user.username} ({user.email}) {user.permission}
                </p>

                {/* Permission-based buttons */}
                {user.permission === null || user.permission === undefined ? (
                  // Show the "Add" button if no permission
                  <button
                    onClick={() => handleAddUser(user.id)}
                    className="text-blue-600 hover:text-blue-500 px-4 py-1 border rounded-md"
                  >
                    Add
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    {user.permission === "Editor" || user.permission === "Viewer" ? (
                      <>
                        <button
                          onClick={() => handleChangePermission(user.id)}
                          className="text-blue-600 hover:text-blue-500 px-4 py-1 border rounded-md"
                        >
                          Change Permission
                        </button>
                        <button
                          onClick={() => handleDeletePermission(user.id)}
                          className="text-red-600 hover:text-red-500 px-4 py-1 border rounded-md"
                        >
                          Delete Permission
                        </button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No users found or no permission available.</p>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full py-2 px-4 bg-gray-600 text-white rounded-md mt-4"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UserSearchModal;
