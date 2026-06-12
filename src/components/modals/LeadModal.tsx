import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  RotateCcwIcon,
  BuildingIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  UserIcon,
} from "lucide-react";
import Modal from "../ui/Modal";
import type { Lead, LeadUpdateData } from "../../services/mainPortalApi";

const BUSINESS_TYPES = [
  "Restaurante",
  "Café",
  "Bar",
  "Hotel",
  "Boutique",
  "Otro",
];

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSave: (id: string, data: LeadUpdateData) => Promise<void>;
  onDelete: (lead: Lead) => void;
  onStatusChange: (id: string, status: "active" | "completed") => Promise<void>;
  isSaving?: boolean;
}

const Field: React.FC<{ label: string; value: string | null }> = ({
  label,
  value,
}) => (
  <div className="py-2 border-b border-gray-50 last:border-0">
    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
      {label}
    </p>
    <p className="text-sm text-[#023828] font-medium">
      {value || <span className="text-gray-300 font-normal">—</span>}
    </p>
  </div>
);

const LeadModal: React.FC<LeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSave,
  onDelete,
  onStatusChange,
  isSaving = false,
}) => {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [form, setForm] = useState<LeadUpdateData>({});
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      setMode("view");
      setForm({
        restaurantName: lead.restaurantName,
        contactName: lead.contactName,
        email: lead.email,
        phone: lead.phone ?? "",
        city: lead.city ?? "",
        businessType: lead.businessType ?? "",
      });
    }
  }, [isOpen, lead]);

  if (!lead) return null;

  const isCompleted = lead.status === "completed";

  const handleSave = async () => {
    await onSave(lead.id, {
      ...form,
      phone: form.phone || null,
      city: form.city || null,
      businessType: form.businessType || null,
    });
    setMode("view");
  };

  const handleStatusToggle = async () => {
    setIsChangingStatus(true);
    try {
      await onStatusChange(lead.id, isCompleted ? "active" : "completed");
      onClose();
    } finally {
      setIsChangingStatus(false);
    }
  };

  const title = mode === "edit" ? "Editar lead" : lead.restaurantName;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {mode === "view" ? (
        <div className="space-y-4">
          {/* Info */}
          <div className="space-y-0.5">
            <Field label="Establecimiento" value={lead.restaurantName} />
            <Field label="Tipo de negocio" value={lead.businessType} />
            <Field label="Ciudad" value={lead.city} />
            <Field label="Contacto" value={lead.contactName} />
            <Field label="Email" value={lead.email} />
            <Field label="Teléfono" value={lead.phone} />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 pt-1">
            {/* Complete / Reactivate */}
            <button
              onClick={handleStatusToggle}
              disabled={isChangingStatus}
              className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-md text-sm font-medium transition-colors disabled:opacity-60 ${
                isCompleted
                  ? "bg-[#FEFEEB] text-[#023828] border border-[rgba(2,56,40,0.15)] hover:bg-[#f0f0d8]"
                  : "bg-[#82E657] text-[#023828] hover:bg-[#6fd048]"
              }`}
            >
              {isCompleted ? (
                <>
                  <RotateCcwIcon className="h-4 w-4" />
                  Reactivar
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4" />
                  Marcar como completado
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setMode("edit")}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-md text-sm font-medium bg-[#023828] text-white hover:bg-[#034d38] transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(lead)}
                className="flex items-center justify-center gap-2 flex-1 px-4 py-2.5 rounded-md text-sm font-medium bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Edit mode */
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <BuildingIcon className="inline h-3 w-3 mr-1" />
                Establecimiento *
              </label>
              <input
                type="text"
                value={form.restaurantName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, restaurantName: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md text-[#023828] focus:outline-none focus:ring-2 focus:ring-[#023828]/20 focus:border-[#023828]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <TagIcon className="inline h-3 w-3 mr-1" />
                Tipo de negocio
              </label>
              <select
                value={form.businessType ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, businessType: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md text-[#023828] bg-white focus:outline-none focus:ring-2 focus:ring-[#023828]/20 focus:border-[#023828]"
              >
                <option value="">—</option>
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <MapPinIcon className="inline h-3 w-3 mr-1" />
                Ciudad
              </label>
              <input
                type="text"
                value={form.city ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md text-[#023828] focus:outline-none focus:ring-2 focus:ring-[#023828]/20 focus:border-[#023828]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <UserIcon className="inline h-3 w-3 mr-1" />
                Contacto *
              </label>
              <input
                type="text"
                value={form.contactName ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactName: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md text-[#023828] focus:outline-none focus:ring-2 focus:ring-[#023828]/20 focus:border-[#023828]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <MailIcon className="inline h-3 w-3 mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md text-[#023828] focus:outline-none focus:ring-2 focus:ring-[#023828]/20 focus:border-[#023828]"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">
                <PhoneIcon className="inline h-3 w-3 mr-1" />
                Teléfono
              </label>
              <input
                type="tel"
                value={form.phone ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md text-[#023828] focus:outline-none focus:ring-2 focus:ring-[#023828]/20 focus:border-[#023828]"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setMode("view")}
              disabled={isSaving}
              className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={
                isSaving ||
                !form.restaurantName ||
                !form.contactName ||
                !form.email
              }
              className="flex-1 px-4 py-2.5 rounded-md text-sm font-medium bg-[#023828] text-white hover:bg-[#034d38] transition-colors disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default LeadModal;
