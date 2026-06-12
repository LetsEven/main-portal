import React, { useState, useEffect, useRef } from "react";
import {
  CalendarIcon,
  UserIcon,
  LayersIcon,
  UsersIcon,
  FilterIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
interface FilterProps {
  filters?: FilterState; // Prop opcional para hacer el componente controlado
  onFilterChange: (filters: FilterState) => void;
  restaurants?: Array<{ id: number; name: string }>;
}
export interface FilterState {
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
  restaurantIds: number[];
  client: string;
  services: string[];
  gender: string;
  ageRange: {
    min: number;
    max: number;
  };
}

// Fecha por defecto (últimos 30 días)
const getDefaultDateRange = () => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  return {
    startDate,
    endDate,
  };
};

const initialFilters: FilterState = {
  dateRange: getDefaultDateRange(),
  restaurantIds: [],
  client: "",
  services: [],
  gender: "",
  ageRange: {
    min: 0,
    max: 0,
  },
};
const DashboardFiltersComponent: React.FC<FilterProps> = ({
  filters: controlledFilters,
  onFilterChange,
  restaurants = [],
}) => {
  // Si recibimos filters como prop, usar esos (componente controlado)
  // Si no, usar estado interno (componente no controlado)
  const [internalFilters, setInternalFilters] =
    useState<FilterState>(initialFilters);
  const filters = controlledFilters || internalFilters;
  const setFilters = controlledFilters ? onFilterChange : setInternalFilters;
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isAgeRangeOpen, setIsAgeRangeOpen] = useState(false);
  const [isRestaurantOpen, setIsRestaurantOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Estado temporal para las fechas antes de aplicar
  const [tempDateRange, setTempDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  // Refs para detectar clics fuera de los dropdowns
  const datePickerRef = useRef<HTMLDivElement>(null);
  const restaurantRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);
  const ageRangeRef = useRef<HTMLDivElement>(null);

  // Sincronizar tempDateRange cuando se abre el date picker
  useEffect(() => {
    if (isDatePickerOpen) {
      setTempDateRange(filters.dateRange);
    }
  }, [isDatePickerOpen, filters.dateRange]);

  // Notificar al padre cuando los filtros cambien (excepto en el mount inicial)
  // Solo se usa cuando el componente es no controlado
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (controlledFilters) return; // Si es controlado, no notificar aquí
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    onFilterChange(filters);
  }, [filters, onFilterChange, controlledFilters]);

  // Detectar clics fuera de los dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
      if (
        restaurantRef.current &&
        !restaurantRef.current.contains(event.target as Node)
      ) {
        setIsRestaurantOpen(false);
      }
      if (
        servicesRef.current &&
        !servicesRef.current.contains(event.target as Node)
      ) {
        setIsServicesOpen(false);
      }
      if (
        genderRef.current &&
        !genderRef.current.contains(event.target as Node)
      ) {
        setIsGenderOpen(false);
      }
      if (
        ageRangeRef.current &&
        !ageRangeRef.current.contains(event.target as Node)
      ) {
        setIsAgeRangeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Lista de servicios para Super Admin
  const serviceOptions = [
    "Flex Bill",
    "Tap Order & Pay",
    "Pick & Go",
    "Room Service",
    "Tap & Pay",
  ];
  // Rangos de edad predefinidos
  const ageRangeOptions = [
    {
      label: "Todas las edades",
      min: 0,
      max: 0,
    },
    {
      label: "18-24",
      min: 18,
      max: 24,
    },
    {
      label: "25-34",
      min: 25,
      max: 34,
    },
    {
      label: "35-44",
      min: 35,
      max: 44,
    },
    {
      label: "45-54",
      min: 45,
      max: 54,
    },
    {
      label: "55+",
      min: 55,
      max: 100,
    },
  ];

  // Opciones de género
  const genderOptions = ["Masculino", "Femenino", "Otro"];

  // Helper para convertir Date a string formato YYYY-MM-DD (sin zona horaria)
  const dateToInputValue = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Helper para convertir string YYYY-MM-DD a Date (sin zona horaria)
  const inputValueToDate = (value: string): Date | null => {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const handleDateChange = (range: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    // Solo actualizar el estado temporal, no aplicar el filtro aún
    setTempDateRange(range);
  };

  const applyDateFilter = () => {
    // Validar que ambas fechas estén seleccionadas
    if (tempDateRange.startDate && tempDateRange.endDate) {
      const newFilters = {
        ...filters,
        dateRange: tempDateRange,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
      setIsDatePickerOpen(false);
    }
  };

  const cancelDateFilter = () => {
    // Restaurar las fechas temporales a las del filtro actual
    setTempDateRange(filters.dateRange);
    setIsDatePickerOpen(false);
  };

  const clearDateFilter = () => {
    // Limpiar las fechas
    const newFilters = {
      ...filters,
      dateRange: {
        startDate: null,
        endDate: null,
      },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsDatePickerOpen(false);
  };

  const handleRestaurantToggle = (restaurantId: number) => {
    let updatedRestaurants;
    if (filters.restaurantIds.includes(restaurantId)) {
      updatedRestaurants = filters.restaurantIds.filter(
        (id) => id !== restaurantId,
      );
    } else {
      updatedRestaurants = [...filters.restaurantIds, restaurantId];
    }
    const newFilters = {
      ...filters,
      restaurantIds: updatedRestaurants,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsRestaurantOpen(false);
  };

  const handleSelectAllRestaurants = () => {
    const newFilters = {
      ...filters,
      restaurantIds:
        filters.restaurantIds.length === restaurants.length
          ? []
          : restaurants.map((r) => r.id),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsRestaurantOpen(false);
  };

  const handleServiceToggle = (service: string) => {
    let updatedServices;
    if (filters.services.includes(service)) {
      updatedServices = filters.services.filter((s) => s !== service);
    } else {
      updatedServices = [...filters.services, service];
    }
    const newFilters = {
      ...filters,
      services: updatedServices,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsServicesOpen(false);
  };

  const handleSelectAllServices = () => {
    const newFilters = {
      ...filters,
      services:
        filters.services.length === serviceOptions.length
          ? []
          : [...serviceOptions],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsServicesOpen(false);
  };

  const handleGenderChange = (gender: string) => {
    const newFilters = {
      ...filters,
      gender,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsGenderOpen(false);
  };

  const handleAgeRangeChange = (min: number, max: number) => {
    const newFilters = {
      ...filters,
      ageRange: {
        min,
        max,
      },
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
    setIsAgeRangeOpen(false);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };

  // Verificar el rango de fechas y retornar el texto apropiado
  const getDateRangeLabel = () => {
    if (!filters.dateRange.startDate || !filters.dateRange.endDate) {
      return "Todo el tiempo";
    }

    const today = new Date();
    const startDate = filters.dateRange.startDate;
    const endDate = filters.dateRange.endDate;

    // Comparar las fechas
    const endDateStr = endDate.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    // Calcular diferencia en días
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Verificar si el end date es hoy
    const isToday = endDateStr === todayStr;

    if (isToday) {
      if (diffDays === 7) {
        return "Últimos 7 días";
      } else if (diffDays === 30) {
        return "Últimos 30 días";
      } else if (diffDays === 90) {
        return "Últimos 90 días";
      } else if (diffDays >= 365 && diffDays <= 366) {
        return "Último año";
      }
    }

    // Si no coincide con ningún preset, mostrar las fechas
    return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
  };

  // Función helper para determinar qué acceso rápido está activo
  const getActiveQuickAccess = () => {
    if (!filters.dateRange.startDate || !filters.dateRange.endDate) {
      return "allTime";
    }

    const today = new Date();
    const startDate = filters.dateRange.startDate;
    const endDate = filters.dateRange.endDate;

    // Comparar solo las fechas (sin hora)
    const endDateStr = endDate.toISOString().split("T")[0];
    const todayStr = today.toISOString().split("T")[0];

    // Calcular diferencia en días
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Verificar si el end date es hoy
    const isToday = endDateStr === todayStr;

    if (isToday) {
      if (diffDays === 7) return "last7days";
      if (diffDays === 30) return "last30days";
      if (diffDays === 90) return "last90days";
      if (diffDays >= 365 && diffDays <= 366) return "lastYear";
    }

    return "custom";
  };

  // Formato de fechas para mostrar
  const formatDateRange = () => {
    return getDateRangeLabel();
  };

  // Formato para mostrar servicios seleccionados
  const formatServices = () => {
    if (filters.services.length === 0) return "Todos los servicios";
    if (filters.services.length === 1) return filters.services[0];
    return `${filters.services.length} servicios`;
  };

  // Formato para mostrar restaurantes seleccionados
  const formatRestaurants = () => {
    if (filters.restaurantIds.length === 0) return "Todos los Restaurantes";
    if (filters.restaurantIds.length === 1) {
      return (
        restaurants.find((r) => r.id === filters.restaurantIds[0])?.name ||
        "1 restaurante"
      );
    }
    return `${filters.restaurantIds.length} restaurantes`;
  };

  // Formato para mostrar rango de edad
  const formatAgeRange = () => {
    if (filters.ageRange.min === 0 && filters.ageRange.max === 0) {
      return "Todas las edades";
    }
    return `${filters.ageRange.min}-${filters.ageRange.max === 100 ? "+" : filters.ageRange.max}`;
  };

  // Helper para determinar si un filtro está activo
  const isDateActive = filters.dateRange.startDate && filters.dateRange.endDate;
  const isRestaurantActive = filters.restaurantIds.length > 0;
  const isServiceActive = filters.services.length > 0;
  const isGenderActive = filters.gender !== "";
  const isAgeRangeActive = !(
    filters.ageRange.min === 0 && filters.ageRange.max === 0
  );

  // Contar filtros activos para mostrar badge en móvil
  const activeFiltersCount = [
    isDateActive,
    isRestaurantActive,
    isServiceActive,
    isGenderActive,
    isAgeRangeActive,
  ].filter(Boolean).length;

  // Clases reutilizables
  const btnBase =
    "flex items-center px-3 py-1.5 text-xs uppercase tracking-widest w-full sm:w-auto justify-between sm:justify-start transition-colors";
  const btnInactive = "bg-[#FEFEEB] hover:bg-[#C3FEFF] text-[#023828]";
  const btnActive =
    "bg-[#82E657]/20 border border-[#023828] text-[#023828] hover:bg-[#82E657]/30";
  const dropdownPanel =
    "absolute left-0 right-0 sm:right-auto mt-1 bg-white border-2 border-[#023828]/20 p-2 z-20 w-full shadow-sm";
  const dropdownItem =
    "px-2 py-1.5 hover:bg-[#C3FEFF] cursor-pointer text-xs uppercase tracking-widest text-[#023828] transition-colors";
  const dropdownItemActive = "bg-[#82E657]/20 text-[#023828]";

  return (
    <div className="bg-white border-b border-[#023828]/10 p-3 mb-6 sticky top-0 z-10">
      {/* Botón de filtros para móvil */}
      <div className="md:hidden flex items-center justify-between mb-2">
        <button
          className="flex items-center px-3 py-2 text-xs uppercase tracking-widest bg-[#FEFEEB] hover:bg-[#C3FEFF] text-[#023828] w-full justify-between transition-colors"
          onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
        >
          <span className="flex items-center">
            <FilterIcon className="w-4 h-4 mr-2 text-[#023828]/50" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 bg-[#82E657] text-[#023828] text-xs px-2 py-0.5">
                {activeFiltersCount}
              </span>
            )}
          </span>
          {isMobileFiltersOpen ? (
            <ChevronUpIcon className="w-4 h-4 text-[#023828]/50" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-[#023828]/50" />
          )}
        </button>
      </div>

      {/* Contenedor de filtros - visible en desktop, colapsable en móvil */}
      <div
        className={`${isMobileFiltersOpen ? "flex" : "hidden"} md:flex flex-wrap items-center gap-2`}
      >
        {/* Filtro de Rango de Fechas */}
        <div className="relative w-full sm:w-auto" ref={datePickerRef}>
          <button
            className={`${btnBase} ${isDateActive ? btnActive : btnInactive}`}
            onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <span className="flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-[#023828]/50" />
              <span className="whitespace-nowrap">{formatDateRange()}</span>
            </span>
          </button>
          {isDatePickerOpen && (
            <div className={`${dropdownPanel} sm:w-72`}>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#023828]/50 block mb-1">
                    Inicio
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full text-xs p-1.5 border-2 border-[#023828]/20 bg-white text-[#023828] focus:outline-none focus:border-[#023828]"
                    value={dateToInputValue(tempDateRange.startDate)}
                    onChange={(e) =>
                      handleDateChange({
                        startDate: inputValueToDate(e.target.value),
                        endDate: tempDateRange.endDate,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-[#023828]/50 block mb-1">
                    Fin
                  </label>
                  <input
                    type="date"
                    required
                    max={new Date().toISOString().split("T")[0]}
                    min={
                      tempDateRange.startDate
                        ? dateToInputValue(tempDateRange.startDate)
                        : undefined
                    }
                    className="w-full text-xs p-1.5 border-2 border-[#023828]/20 bg-white text-[#023828] focus:outline-none focus:border-[#023828]"
                    value={dateToInputValue(tempDateRange.endDate)}
                    onChange={(e) =>
                      handleDateChange({
                        startDate: tempDateRange.startDate,
                        endDate: inputValueToDate(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Accesos rápidos */}
              <div className="mb-3 pt-2 border-t border-[#023828]/10">
                <label className="text-xs uppercase tracking-widest text-[#023828]/50 block mb-2">
                  Accesos rápidos
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    {
                      key: "allTime",
                      label: "Todo el tiempo",
                      onClick: () => {
                        const nf = {
                          ...filters,
                          dateRange: { startDate: null, endDate: null },
                        };
                        setFilters(nf);
                        onFilterChange(nf);
                        setIsDatePickerOpen(false);
                      },
                    },
                    {
                      key: "last7days",
                      label: "7 días",
                      onClick: () => {
                        const e = new Date();
                        const s = new Date();
                        s.setDate(s.getDate() - 7);
                        const nf = {
                          ...filters,
                          dateRange: { startDate: s, endDate: e },
                        };
                        setFilters(nf);
                        onFilterChange(nf);
                        setIsDatePickerOpen(false);
                      },
                    },
                    {
                      key: "last30days",
                      label: "30 días",
                      onClick: () => {
                        const e = new Date();
                        const s = new Date();
                        s.setDate(s.getDate() - 30);
                        const nf = {
                          ...filters,
                          dateRange: { startDate: s, endDate: e },
                        };
                        setFilters(nf);
                        onFilterChange(nf);
                        setIsDatePickerOpen(false);
                      },
                    },
                    {
                      key: "last90days",
                      label: "90 días",
                      onClick: () => {
                        const e = new Date();
                        const s = new Date();
                        s.setDate(s.getDate() - 90);
                        const nf = {
                          ...filters,
                          dateRange: { startDate: s, endDate: e },
                        };
                        setFilters(nf);
                        onFilterChange(nf);
                        setIsDatePickerOpen(false);
                      },
                    },
                    {
                      key: "lastYear",
                      label: "1 año",
                      onClick: () => {
                        const e = new Date();
                        const s = new Date();
                        s.setMonth(s.getMonth() - 12);
                        const nf = {
                          ...filters,
                          dateRange: { startDate: s, endDate: e },
                        };
                        setFilters(nf);
                        onFilterChange(nf);
                        setIsDatePickerOpen(false);
                      },
                    },
                  ].map(({ key, label, onClick }) => (
                    <button
                      key={key}
                      onClick={onClick}
                      className={`px-2 py-1.5 text-xs uppercase tracking-widest transition-colors ${
                        getActiveQuickAccess() === key
                          ? "bg-[#82E657]/20 border border-[#023828] text-[#023828] font-medium"
                          : "text-[#023828]/60 bg-[#FEFEEB] hover:bg-[#C3FEFF]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#023828]/10">
                {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                  <button
                    onClick={clearDateFilter}
                    className="w-full px-3 py-1.5 text-xs uppercase tracking-widest text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    Limpiar fechas
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={cancelDateFilter}
                    className="flex-1 px-3 py-1.5 text-xs uppercase tracking-widest text-[#023828] bg-[#FEFEEB] hover:bg-[#C3FEFF] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={applyDateFilter}
                    disabled={
                      !tempDateRange.startDate || !tempDateRange.endDate
                    }
                    className="flex-1 px-3 py-1.5 text-xs uppercase tracking-widest bg-[#023828] text-[#82E657] hover:bg-[#034d38] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filtro de Restaurante */}
        <div className="relative w-full sm:w-auto" ref={restaurantRef}>
          <button
            className={`${btnBase} ${isRestaurantActive ? btnActive : btnInactive}`}
            onClick={() => setIsRestaurantOpen(!isRestaurantOpen)}
          >
            <span className="flex items-center">
              <UserIcon className="w-3.5 h-3.5 mr-1.5 text-[#023828]/50" />
              <span className="whitespace-nowrap">{formatRestaurants()}</span>
            </span>
          </button>
          {isRestaurantOpen && (
            <div className={`${dropdownPanel} sm:w-64`}>
              <div
                className={`${dropdownItem} border-b border-[#023828]/10 mb-1`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectAllRestaurants();
                }}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      filters.restaurantIds.length === restaurants.length
                    }
                    className="pointer-events-none"
                    readOnly
                  />
                  Todos los Restaurantes
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className={dropdownItem}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRestaurantToggle(restaurant.id);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.restaurantIds.includes(restaurant.id)}
                        className="pointer-events-none"
                        readOnly
                      />
                      {restaurant.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtro de Servicio */}
        <div className="relative w-full sm:w-auto" ref={servicesRef}>
          <button
            className={`${btnBase} ${isServiceActive ? btnActive : btnInactive}`}
            onClick={() => setIsServicesOpen(!isServicesOpen)}
          >
            <span className="flex items-center">
              <LayersIcon className="w-3.5 h-3.5 mr-1.5 text-[#023828]/50" />
              <span className="whitespace-nowrap">{formatServices()}</span>
            </span>
          </button>
          {isServicesOpen && (
            <div className={`${dropdownPanel} sm:w-64`}>
              <div
                className={`${dropdownItem} border-b border-[#023828]/10 mb-1`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelectAllServices();
                }}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.services.length === serviceOptions.length}
                    className="pointer-events-none"
                    readOnly
                  />
                  Todos los servicios
                </span>
              </div>
              {serviceOptions.map((service) => (
                <div
                  key={service}
                  className={dropdownItem}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleServiceToggle(service);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.services.includes(service)}
                      className="pointer-events-none"
                      readOnly
                    />
                    {service}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Género */}
        <div className="relative w-full sm:w-auto" ref={genderRef}>
          <button
            className={`${btnBase} ${isGenderActive ? btnActive : btnInactive}`}
            onClick={() => setIsGenderOpen(!isGenderOpen)}
          >
            <span className="flex items-center">
              <UsersIcon className="w-3.5 h-3.5 mr-1.5 text-[#023828]/50" />
              <span className="whitespace-nowrap">
                {filters.gender || "Todos los Diners"}
              </span>
            </span>
          </button>
          {isGenderOpen && (
            <div className={`${dropdownPanel} sm:w-48`}>
              <div
                className={dropdownItem}
                onClick={() => handleGenderChange("")}
              >
                Todos los Diners
              </div>
              {genderOptions.map((gender) => (
                <div
                  key={gender}
                  className={`${dropdownItem} ${filters.gender === gender ? dropdownItemActive : ""}`}
                  onClick={() => handleGenderChange(gender)}
                >
                  {gender}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filtro de Rango de Edad */}
        <div className="relative w-full sm:w-auto" ref={ageRangeRef}>
          <button
            className={`${btnBase} ${isAgeRangeActive ? btnActive : btnInactive}`}
            onClick={() => setIsAgeRangeOpen(!isAgeRangeOpen)}
          >
            <span className="flex items-center">
              <FilterIcon className="w-3.5 h-3.5 mr-1.5 text-[#023828]/50" />
              <span className="whitespace-nowrap">{formatAgeRange()}</span>
            </span>
          </button>
          {isAgeRangeOpen && (
            <div className={`${dropdownPanel} sm:w-48`}>
              {ageRangeOptions.map((range) => (
                <div
                  key={range.label}
                  className={`${dropdownItem} ${filters.ageRange.min === range.min && filters.ageRange.max === range.max ? dropdownItemActive : ""}`}
                  onClick={() => handleAgeRangeChange(range.min, range.max)}
                >
                  {range.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Limpiar Filtros */}
        <button
          className="w-full sm:w-auto sm:ml-auto flex items-center justify-center text-[#023828]/40 hover:text-red-500 px-3 py-1.5 text-xs uppercase tracking-widest mt-2 sm:mt-0 transition-colors"
          onClick={clearFilters}
        >
          <XIcon className="w-3.5 h-3.5 mr-1" />
          Limpiar
        </button>
      </div>
    </div>
  );
};

const DashboardFilters = React.memo(
  DashboardFiltersComponent,
  (prevProps: FilterProps, nextProps: FilterProps) => {
    // Solo re-renderizar si las props realmente cambiaron
    const restaurantsEqual =
      JSON.stringify(prevProps.restaurants) ===
      JSON.stringify(nextProps.restaurants);
    const onFilterChangeEqual =
      prevProps.onFilterChange === nextProps.onFilterChange;
    const filtersEqual =
      JSON.stringify(prevProps.filters) === JSON.stringify(nextProps.filters);

    // Retornar true para SKIP render (las props son iguales)
    return restaurantsEqual && onFilterChangeEqual && filtersEqual;
  },
);

DashboardFilters.displayName = "DashboardFilters";

export default DashboardFilters;
