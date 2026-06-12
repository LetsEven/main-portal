"use client";

import React, { useState, useMemo } from "react";
import {
  SearchIcon,
  UsersIcon,
  MailIcon,
  PhoneIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useLeads } from "../../hooks/useApiData";
import { useMainPortalApi } from "../../services/mainPortalApi";
import { formatDate } from "../../utils/formatters";
import LeadModal from "../modals/LeadModal";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";
import type { Lead, LeadUpdateData } from "../../services/mainPortalApi";

const PAGE_SIZE = 10;
type Tab = "active" | "completed";

/* ─── Row ─── */
const LeadRow: React.FC<{ lead: Lead; index: number; onClick: () => void }> = ({
  lead,
  index,
  onClick,
}) => (
  <tr
    onClick={onClick}
    className={`cursor-pointer transition-colors duration-100 ${
      index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
    } hover:bg-gray-50`}
  >
    <td className="px-4 py-3 font-medium text-gray-900 text-sm">
      {lead.restaurantName}
    </td>
    <td className="px-4 py-3">
      {lead.businessType ? (
        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
          {lead.businessType}
        </span>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      )}
    </td>
    <td className="px-4 py-3 text-sm text-gray-600">
      {lead.city ?? <span className="text-gray-300">—</span>}
    </td>
    <td className="px-4 py-3 text-sm text-gray-900">{lead.contactName}</td>
    <td className="px-4 py-3 text-sm text-gray-600">{lead.email}</td>
    <td className="px-4 py-3 text-sm text-gray-600">
      {lead.phone ?? <span className="text-gray-300">—</span>}
    </td>
    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
      {formatDate(lead.createdAt)}
    </td>
  </tr>
);

/* ─── Mobile card ─── */
const LeadCard: React.FC<{ lead: Lead; onClick: () => void }> = ({
  lead,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="bg-gray-50 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
  >
    <div className="flex items-start justify-between gap-2 mb-2">
      <div>
        <p className="font-medium text-gray-900 text-sm">
          {lead.restaurantName}
        </p>
        {lead.businessType && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
            {lead.businessType}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
        {formatDate(lead.createdAt)}
      </span>
    </div>
    <div className="space-y-1 text-xs">
      <div className="flex items-center gap-2 text-gray-700">
        <UsersIcon className="h-3 w-3 shrink-0 text-gray-400" />
        {lead.contactName}
      </div>
      {lead.city && <div className="text-gray-500 pl-5">{lead.city}</div>}
      <div className="flex items-center gap-2 text-gray-600">
        <MailIcon className="h-3 w-3 shrink-0 text-gray-400" />
        <span className="truncate">{lead.email}</span>
      </div>
      {lead.phone && (
        <div className="flex items-center gap-2 text-gray-700">
          <PhoneIcon className="h-3 w-3 shrink-0 text-gray-400" />
          {lead.phone}
        </div>
      )}
    </div>
  </div>
);

/* ─── Skeleton ─── */
const Skeleton = () => (
  <div className="space-y-px">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="h-11 bg-gray-100 animate-pulse" />
    ))}
  </div>
);

/* ─── Page ─── */
const Leads: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [leadModal, setLeadModal] = useState<{
    isOpen: boolean;
    lead: Lead | null;
  }>({
    isOpen: false,
    lead: null,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    lead: Lead | null;
  }>({
    isOpen: false,
    lead: null,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const queryClient = useQueryClient();
  const api = useMainPortalApi();

  const { data, isLoading, isError } = useLeads({
    limit: 200,
    status: activeTab,
  });

  const filtered = useMemo(() => {
    if (!data?.data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.data;
    return data.data.filter(
      (l) =>
        l.restaurantName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.contactName?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setSearch("");
    setPage(0);
  };

  const handleSave = async (id: string, data: LeadUpdateData) => {
    setIsSaving(true);
    try {
      await api.updateLead(id, data);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setLeadModal({ isOpen: false, lead: null });
      toast.success("Lead actualizado");
    } catch {
      toast.error("Error al actualizar el lead");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "active" | "completed",
  ) => {
    await api.updateLeadStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    toast.success(
      status === "completed" ? "Lead completado" : "Lead reactivado",
    );
  };

  const handleDeleteRequest = (lead: Lead) => {
    setLeadModal({ isOpen: false, lead: null });
    setDeleteModal({ isOpen: true, lead });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.lead) return;
    setIsDeleting(true);
    try {
      await api.deleteLead(deleteModal.lead.id);
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      setDeleteModal({ isOpen: false, lead: null });
      toast.success("Lead eliminado");
    } catch {
      toast.error("Error al eliminar el lead");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-widest uppercase text-[#023828]">
            Leads
          </h1>
        </div>
        {data && (
          <div className="flex flex-col items-center px-5 py-3 bg-[#82E657]">
            <span className="text-3xl font-medium text-[#023828] leading-none">
              {data.total}
            </span>
            <span className="text-xs uppercase tracking-widest text-[#023828] mt-1">
              {activeTab === "active" ? "activos" : "completados"}
            </span>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex mb-6 border-b-2 border-[#023828]">
        {(["active", "completed"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-6 py-2 text-xs uppercase tracking-widest font-medium transition-colors -mb-0.5 border-b-2 ${
              activeTab === tab
                ? "bg-[#023828] text-[#82E657] border-[#023828]"
                : "text-[#023828] border-transparent hover:border-[#023828]"
            }`}
          >
            {tab === "active" ? "Activos" : "Completados"}
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm mb-6">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar establecimientos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#82E657] bg-white text-gray-900"
        />
      </div>

      {/* ── Loading ── */}
      {isLoading && <Skeleton />}

      {/* ── Error ── */}
      {isError && (
        <div className="p-4 border-2 border-red-400 text-xs uppercase tracking-widest text-red-600">
          No se pudieron cargar los leads. Intenta de nuevo.
        </div>
      )}

      {/* ── Empty ── */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="py-20 text-center">
          <UsersIcon className="h-8 w-8 mx-auto mb-4 text-[#023828] opacity-20" />
          <p className="text-xs uppercase tracking-widest text-[#023828] opacity-40">
            {search
              ? "Sin resultados"
              : activeTab === "active"
                ? "No hay leads activos"
                : "No hay leads completados"}
          </p>
        </div>
      )}

      {/* ── Desktop table ── */}
      {!isLoading && !isError && paginated.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                {[
                  "Establecimiento",
                  "Tipo",
                  "Ciudad",
                  "Contacto",
                  "Email",
                  "Teléfono",
                  "Registro",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-xs uppercase tracking-widest font-medium text-gray-500"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map((lead, i) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  index={i}
                  onClick={() => setLeadModal({ isOpen: true, lead })}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Mobile cards ── */}
      {!isLoading && !isError && paginated.length > 0 && (
        <div className="md:hidden space-y-3">
          {paginated.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => setLeadModal({ isOpen: true, lead })}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs uppercase tracking-widest text-[#023828]/50">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {search ? " encontrados" : ""}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 border-2 border-[#023828] text-[#023828] hover:bg-[#C3FEFF] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <span className="px-4 py-1.5 text-xs uppercase tracking-widest bg-[#023828] text-[#82E657]">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 border-2 border-[#023828] text-[#023828] hover:bg-[#C3FEFF] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <LeadModal
        isOpen={leadModal.isOpen}
        onClose={() => setLeadModal({ isOpen: false, lead: null })}
        lead={leadModal.lead}
        onSave={handleSave}
        onDelete={handleDeleteRequest}
        onStatusChange={handleStatusChange}
        isSaving={isSaving}
      />
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, lead: null })}
        onConfirm={handleDeleteConfirm}
        title="Eliminar lead"
        itemName={deleteModal.lead?.restaurantName ?? ""}
        itemType="lead"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Leads;
