import React, { useState, useEffect } from "react";

import { MODULES } from "../Administration/Module";
const actionsList = ["view", "add", "edit", "delete"];

export default function TeamMemberModal({
  isOpen,
  onClose,
  onSave,
  memberData,
  roles = [],
  loading = false,
  error = null,
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountActive, setAccountActive] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    setPopup(null);

    if (memberData) {
      setName(memberData.name || "");
      setUsername(memberData.username || "");
      setEmail(memberData.email || "");
      setPassword("");
      setAccountActive(memberData.isActive ?? true);
      setSelectedRoles(
        (memberData.assignedRoles || []).map((role) =>
          typeof role === "object" ? role._id : role,
        ),
      );

      const formattedPermissions = {};

      (memberData.individualPermissions || []).forEach((permission) => {
        const [module, action] = permission.split(".");
        if (!module || !action) return;

        if (!formattedPermissions[module]) {
          formattedPermissions[module] = {};
        }

        formattedPermissions[module][action] = true;
      });

      setPermissions(formattedPermissions);
    } else {
      setName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setAccountActive(true);
      setSelectedRoles([]);
      setPermissions({});
    }
  }, [memberData, isOpen]);

  useEffect(() => {
    if (!error || !isOpen) return;

    setPopup({
      type: "error",
      message: error,
    });
  }, [error, isOpen]);

  useEffect(() => {
    if (!popup) return;

    const timer = setTimeout(() => {
      if (popup.type === "success") {
        onClose();
      } else {
        setPopup(null);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [popup, onClose]);

  if (!isOpen) return null;

  const handleRoleToggle = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const handlePermissionChange = (moduleName, action) => {
    setPermissions((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: !prev[moduleName]?.[action],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopup(null);

    const individualPermissions = Object.entries(permissions).flatMap(
      ([module, moduleActions]) =>
        actionsList
          .filter((action) => moduleActions[action])
          .map((action) => `${module}.${action}`),
    );

    const formData = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      isActive: accountActive,
      assignedRoles: selectedRoles,
      individualPermissions,
    };

    if (password.trim()) {
      formData.password = password;
    }

    if (memberData?._id) {
      formData._id = memberData._id;
    }

    try {
      await onSave(formData);
      setPopup({
        type: "success",
        message: memberData
          ? "Team member updated successfully."
          : "Team member added successfully.",
      });
    } catch (err) {
      setPopup({
        type: "error",
        message:
          err?.message ||
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-[#F8FAFC] rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 animate-in fade-in zoom-in duration-150 flex flex-col max-h-[92vh] overflow-hidden">
        <div className="bg-white px-3 py-2 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {memberData ? "Edit permissions" : "Add team member"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign shared roles or individual permissions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-red-400 hover:text-red-600 text-xl font-bold ml-4"
          >
            &times;
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 text-xs space-y-6">
          <form
            id="team-permissions-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required={!memberData}
                    minLength={memberData ? undefined : 8}
                    placeholder={
                      memberData ? "Leave blank to keep same" : "Enter password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="accountActive"
                  checked={accountActive}
                  onChange={(e) => setAccountActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="accountActive"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Account active
                </label>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Shared roles
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Permissions from selected roles and individual permissions are
                  combined.
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                {roles.map((role) => (
                  <label
                    key={role._id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-100 cursor-pointer"
                  >
                    <span className="text-xs text-slate-700 font-medium truncate">
                      {role.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(role._id)}
                      onChange={() => handleRoleToggle(role._id)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded shrink-0"
                    />
                  </label>
                ))}
                {roles.length === 0 && (
                  <p className="text-xs text-slate-400 col-span-full">
                    No roles found. Please create a role first.
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">
                  Individual permissions
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select individual access permissions for this team member.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-5">Module</th>
                      <th className="py-3 px-4 text-center">View</th>
                      <th className="py-3 px-4 text-center">Add</th>
                      <th className="py-3 px-4 text-center">Edit</th>
                      <th className="py-3 px-4 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MODULES.map((module) => (
                      <tr key={module.name} className="hover:bg-slate-50/60">
                        <td className="py-3 px-5 font-medium text-slate-700 whitespace-nowrap">
                          {module.label}
                        </td>
                        {actionsList.map((action) => (
                          <td key={action} className="py-3 px-4 text-center">
                            {module.actions.includes(action) ? (
                              <input
                                type="checkbox"
                                checked={Boolean(
                                  permissions[module.name]?.[action],
                                )}
                                onChange={() =>
                                  handlePermissionChange(module.name, action)
                                }
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                              />
                            ) : (
                              <span className="text-slate-300 font-bold">
                                &mdash;
                              </span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-2 bg-white px-5 py-3 border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="team-permissions-form"
            disabled={loading || popup?.type === "success"}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
          >
            {loading
              ? "Saving..."
              : memberData
                ? "Update user & permissions"
                : "Save user & permissions"}
          </button>
        </div>
      </div>

      {popup && (
        <div
          className={`fixed top-5 right-5 z-[60] flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl border text-sm font-medium ${
            popup.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <span className="text-base">
            {popup.type === "success" ? "✓" : "!"}
          </span>
          {popup.message}
        </div>
      )}
    </div>
  );
}
