import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import TeamMemberModal from "../Forms/TeamForm";
import {
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
} from "../../../StoreAndHooks/slices/teamSlice";
import { getAllRoles } from "../../../StoreAndHooks/slices/roleSlice";
import Pagination from "../../../components/Pagination";
export default function TeamPermissions() {
  const dispatch = useDispatch();

  const {
    teamMembers,
    loading,
    actionLoading,
    error,
    currentPage,
    totalPages,
    totalMembers,
    limit,
  } = useSelector((state) => state.teamMember);

  const { roles } = useSelector((state) => state.role);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(getAllRoles());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAllTeamMembers({
        search,
        status,
        page,
      }),
    );
  }, [dispatch, search, status, page]);

  const handleSaveMember = async (memberData) => {
    try {
      const isEditing = Boolean(memberData._id || memberData.id);

      if (isEditing) {
        await dispatch(
          updateTeamMember({
            id: memberData._id || memberData.id,
            formData: memberData,
          }),
        ).unwrap();
      } else {
        await dispatch(createTeamMember(memberData)).unwrap();
        setPage(1);
      }

      setIsModalOpen(false);
      setSelectedMember(null);

      dispatch(
        getAllTeamMembers({
          search,
          status,
          page: isEditing ? page : 1,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      await dispatch(
        updateTeamMember({
          id: member._id,
          formData: {
            isActive: !member.isActive,
          },
        }),
      ).unwrap();

      dispatch(
        getAllTeamMembers({
          search,
          status,
          page,
        }),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const startItem = teamMembers.length > 0 ? (page - 1) * (limit || 10) + 1 : 0;

  const endItem = (page - 1) * (limit || 10) + teamMembers.length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] md:p-6 text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Team &amp; permissions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Control who can access your business workspace.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedMember(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-150 inline-flex items-center gap-1.5"
          >
            <Plus size={15} />
            Add team member
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search name, username or email..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              />
            </div>

            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full sm:w-40 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-400 bg-white"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <div className="relative">
              <div className="relative overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/70 text-slate-400 font-semibold text-[10px] uppercase border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Name</th>
                      <th className="px-6 py-4 whitespace-nowrap">Email</th>
                      <th className="px-6 py-4 whitespace-nowrap">Roles</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-center whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.length > 0 ? (
                      teamMembers.map((member) => (
                        <tr
                          key={member._id}
                          className="hover:bg-slate-50/80 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                            {member.name}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {member.email}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {member.assignedRoles?.length > 0 ? (
                                member.assignedRoles.map((role) => (
                                  <span
                                    key={role._id || role}
                                    className="inline-block px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 rounded-md border border-slate-200 whitespace-nowrap"
                                  >
                                    {role.name || "Assigned Role"}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 whitespace-nowrap">
                                  No role
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md whitespace-nowrap ${
                                member.isActive
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                            >
                              {member.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center space-x-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setIsModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors shadow-sm"
                            >
                              Edit permissions
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleToggleStatus(member)}
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-sm disabled:opacity-50 ${
                                member.isActive
                                  ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                  : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-200"
                              }`}
                            >
                              {member.isActive ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : !loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-16 text-slate-400 font-medium text-xs"
                        >
                          No team members found.
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-16 text-slate-400"
                        >
                          Loading team members...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {loading && teamMembers.length > 0 && (
                  <div className="absolute inset-0 bg-white/30 pointer-events-none transition-opacity duration-200" />
                )}
              </div>
            </div>
          </div>
          <Pagination
            totalItems={totalMembers}
            startIndex={startItem - 1}
            currentItemsCount={endItem - startItem + 1}
            currentPage={currentPage}
            totalPages={totalPages}
            pages={Array.from({ length: totalPages }, (_, i) => i + 1)}
            onPageChange={setPage}
            loading={loading}
          />
        </div>
      </div>
      <TeamMemberModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedMember(null);
        }}
        onSave={handleSaveMember}
        memberData={selectedMember}
        roles={roles}
        loading={actionLoading}
        error={error}
      />
    </div>
  );
}
