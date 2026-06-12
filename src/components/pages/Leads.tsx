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
import { useLeads } from "../../hooks/useApiData";
import { formatDate } from "../../utils/formatters";
import type { Lead } from "../../services/mainPortalApi";

const PAGE_SIZE = 10;

const businessTypeLabel: Record<string, string> = {
  Restaurante: "Restaurante",
  Café: "Café",
  Bar: "Bar",
  Hotel: "Hotel",
  Boutique: "Boutique",
  Otro: "Otro",
};

const LeadRow: React.FC<{ lead: Lead; index: number }> = ({ lead, index }) => (
  <tr className={index % 2 === 0 ? "bg-white" : "bg-[#FEFEEB]"}>
    <td className="px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="font-medium text-[#023828] text-sm">
          {lead.restaurantName}
        </span>
      </div>
    </td>
    <td className="px-4 py-3">
      {lead.businessType ? (
        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-[#82E657] text-[#023828]">
          {businessTypeLabel[lead.businessType] ?? lead.businessType}
        </span>
      ) : (
        <span className="text-gray-400 text-xs">—</span>
      )}
    </td>
    <td className="px-4 py-3 text-sm text-[#023828]">
      {lead.city ?? <span className="text-gray-400">—</span>}
    </td>
    <td className="px-4 py-3 text-sm text-[#023828]">{lead.contactName}</td>
    <td className="px-4 py-3">
      <a
        href={`mailto:${lead.email}`}
        className="text-sm text-[#299E66] hover:underline"
      >
        {lead.email}
      </a>
    </td>
    <td className="px-4 py-3 text-sm text-[#023828]">
      {lead.phone ? (
        <a href={`tel:${lead.phone}`} className="hover:underline">
          {lead.phone}
        </a>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>
    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
      {formatDate(lead.createdAt)}
    </td>
  </tr>
);

const LeadCard: React.FC<{ lead: Lead }> = ({ lead }) => (
  <div className="bg-white border border-gray-100 p-4 space-y-2">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-semibold text-[#023828] text-sm">
          {lead.restaurantName}
        </p>
        {lead.businessType && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-xs text-xs bg-[#C3FEFF] text-[#023828]">
            {lead.businessType}
          </span>
        )}
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {formatDate(lead.createdAt)}
      </span>
    </div>
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-[#023828]">
        <UsersIcon className="h-3.5 w-3.5 text-gray-400" />
        {lead.contactName}
      </div>
      {lead.city && (
        <div className="flex items-center gap-2 text-sm text-[#023828]">
          {lead.city}
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <MailIcon className="h-3.5 w-3.5 text-gray-400" />
        <a
          href={`mailto:${lead.email}`}
          className="text-[#299E66] hover:underline truncate"
        >
          {lead.email}
        </a>
      </div>
      {lead.phone && (
        <div className="flex items-center gap-2 text-sm text-[#023828]">
          <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
          {lead.phone}
        </div>
      )}
    </div>
  </div>
);

const Leads: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useLeads({ limit: 200 });

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

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#023828]">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Solicitudes recibidas desde el landing page
          </p>
        </div>
        {data && (
          <div className="bg-[#FEFEEB] border border-[rgba(2,56,40,0.12)] rounded-md px-4 py-2 text-center">
            <p className="text-2xl font-bold text-[#023828]">{data.total}</p>
            <p className="text-xs text-gray-500">total</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por establecimiento, email..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-sm bg-white text-[#023828] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#023828]/20 focus:border-[#023828]"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
          No se pudieron cargar los leads. Intenta de nuevo.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <UsersIcon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            {search ? "Sin resultados para tu búsqueda." : "Aún no hay leads."}
          </p>
        </div>
      )}

      {/* Desktop table */}
      {!isLoading && !isError && paginated.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-md border border-gray-100 shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#023828] text-white text-xs uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Establecimiento</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Ciudad</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Teléfono</th>
                <th className="px-4 py-3 font-medium">
                  <span className="flex items-center gap-1">Registro</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((lead, i) => (
                <LeadRow key={lead.id} lead={lead} index={i} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!isLoading && !isError && paginated.length > 0 && (
        <div className="md:hidden space-y-3">
          {paginated.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {search && " encontrados"}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <span className="px-3 py-1 rounded bg-[#023828] text-white text-xs font-medium">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;
