import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../../StoreAndHooks/slices/roleSlice";
import { MODULES } from "./Module";

const ACTIONS = ["view", "add", "edit", "delete"];

export const ALL_PERMISSIONS = MODULES.flatMap((module) =>
  module.actions.map((action) => `${module.name}.${action}`),
);
const createEmptyPermissions = () =>
  Object.fromEntries(ALL_PERMISSIONS.map((permission) => [permission, false]));

export default function RolesPermissions() {
  const dispatch = useDispatch();

  const {
    roles = [],
    loading,
    actionLoading,
    error,
  } = useSelector((state) => state.role);

  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedRole, setExpandedRole] = useState(null);
  const [permissionsState, setPermissionsState] = useState(
    createEmptyPermissions(),
  );

  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);

  const generateSlug = (value) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSelectRole = (role) => {
    if (expandedRole === role._id) {
      setExpandedRole(null);
      return;
    }

    setSelectedRole(role);
    setExpandedRole(role._id);
    setRoleName(role.name || "");
    setDescription(role.description || "");

    const newPermissions = createEmptyPermissions();

    (role.permissions || []).forEach((permission) => {
      if (ALL_PERMISSIONS.includes(permission)) {
        newPermissions[permission] = true;
      }
    });

    setPermissionsState(newPermissions);
  };

  const handleNewRole = () => {
    setSelectedRole(null);
    setExpandedRole(null);
    setRoleName("");
    setDescription("");
    setPermissionsState(createEmptyPermissions());
  };

  const handlePermissionToggle = (permission) => {
    setPermissionsState((prev) => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) return;

    const permissions = ALL_PERMISSIONS.filter(
      (permission) => permissionsState[permission],
    );

    const formData = {
      name: roleName.trim(),
      slug: generateSlug(roleName),
      description: description.trim(),
      permissions,
    };

    try {
      if (selectedRole?._id) {
        await dispatch(
          updateRole({
            id: selectedRole._id,
            formData,
          }),
        ).unwrap();
      } else {
        await dispatch(createRole(formData)).unwrap();
      }

      await dispatch(getAllRoles()).unwrap();
      handleNewRole();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete ${role.name}?`)) {
      return;
    }

    try {
      await dispatch(deleteRole(role._id)).unwrap();

      if (selectedRole?._id === role._id) {
        handleNewRole();
      }

      await dispatch(getAllRoles()).unwrap();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Roles &amp; permissions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Shared access profiles for your team.
            </p>
          </div>

          <button
            type="button"
            onClick={handleNewRole}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            + New role
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-xs">
            {typeof error === "string"
              ? error
              : error.message || "Something went wrong"}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Existing roles
            </h2>

            {loading ? (
              <p className="text-xs text-slate-400">Loading roles...</p>
            ) : roles.length === 0 ? (
              <p className="text-xs text-slate-400">No roles found.</p>
            ) : (
              <div className="space-y-3">
                {roles.map((role) => {
                  const isExpanded = expandedRole === role._id;

                  return (
                    <div
                      key={role._id}
                      className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectRole(role)}
                          className="flex-1 min-w-0 text-left flex items-center gap-2"
                        >
                          <span className="text-[10px] text-slate-400">
                            {isExpanded ? "▼" : "►"}
                          </span>
                          <span className="text-xs font-bold text-slate-800 hover:text-blue-600 truncate">
                            {role.name}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRole(role)}
                          disabled={actionLoading}
                          className="text-[10px] text-red-500 hover:text-red-700 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-2 pl-4 space-y-1">
                          <p className="text-[10px] text-blue-600">
                            {role.slug}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-relaxed break-words">
                            {role.description || "No description"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {role.permissions?.length || 0} permissions assigned
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm p-3 md:p-5 space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {selectedRole ? "Update role" : "Create new role"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign permissions to this shared role.
              </p>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Role name
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. Sales Manager"
                    className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Slug
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={generateSlug(roleName)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-500 bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this role..."
                    className="w-full text-xs border border-slate-200 rounded-lg px-3.5 py-2.5 text-slate-800 bg-white focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                      <tr>
                        <th className="py-3 px-5">Module</th>
                        {ACTIONS.map((action) => (
                          <th key={action} className="py-3 px-4 text-center">
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {MODULES.map((module) => (
                        <tr key={module.name} className="hover:bg-slate-50/60">
                          <td className="py-3 px-5 font-medium text-slate-700 whitespace-nowrap">
                            {module.label}
                          </td>

                          {ACTIONS.map((action) => {
                            const permission = `${module.name}.${action}`;

                            return (
                              <td
                                key={action}
                                className="py-3 px-4 text-center"
                              >
                                {module.actions.includes(action) ? (
                                  <input
                                    type="checkbox"
                                    checked={Boolean(
                                      permissionsState[permission],
                                    )}
                                    onChange={() =>
                                      handlePermissionToggle(permission)
                                    }
                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded cursor-pointer"
                                  />
                                ) : (
                                  <span className="text-slate-300 font-bold">
                                    &mdash;
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
                >
                  {actionLoading
                    ? "Saving..."
                    : selectedRole
                      ? "Update role"
                      : "Save role"}
                </button>

                {selectedRole && (
                  <button
                    type="button"
                    onClick={handleNewRole}
                    disabled={actionLoading}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
