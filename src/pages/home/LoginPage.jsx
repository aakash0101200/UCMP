import React, { useState } from "react";
import { login } from "../../Services/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ collegeId: "", password: "" });
  const [roleOptions, setRoleOptions] = useState([]);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(formData.collegeId, formData.password);

    if (!res) return;

    if (typeof res === "string") {
      // Single role
      navigateBasedOnRole(res);
    } else if (res.multiple) {
      // Multiple roles
      setRoleOptions(res.roles);
      setShowRoleModal(true);
    }
  };

  const navigateBasedOnRole = (role) => {
    localStorage.setItem("role", role);
    if (role === "student") navigate("/student");
    else if (role === "faculty") navigate("/faculty");
    else if (role === "admin") navigate("/admin");
    else navigate("/");
  };

  const handleRoleSelect = (role) => {
    toast.success(`Role selected: ${role}`);
    navigateBasedOnRole(role.toLowerCase());
    setShowRoleModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <form
        className="p-6 bg-white rounded-lg shadow-lg w-96"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <input
          type="text"
          placeholder="College ID"
          value={formData.collegeId}
          onChange={(e) =>
            setFormData({ ...formData, collegeId: e.target.value })
          }
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full mb-3 p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-4">Select Your Role</h3>
            {roleOptions.map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="w-full mb-2 p-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
