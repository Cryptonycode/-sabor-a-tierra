'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FarmerDetailsModal from '@/components/FarmerDetailsModal';
import {
  FARMER_STATUS_BADGE_CLASSES,
  FARMER_STATUS_LABELS,
  formatFarmerDate,
  getProductionTypeLabel,
  matchesFarmerSearch
} from '@/lib/farmerRecords';
import { adminFarmerService } from '@/services/adminFarmerService';
import type { FarmerRecord, FarmerStatus } from '@/types/farmer';

const TABS: { key: FarmerStatus; label: string; hint: string }[] = [
  { key: 'pending', label: 'Pendientes', hint: 'Solicitudes a la espera de revisión' },
  { key: 'approved', label: 'Aceptados', hint: 'Agricultores activos en la plataforma' },
  { key: 'rejected', label: 'Rechazados', hint: 'Descartados o suspendidos, puedes reactivarlos' }
];

const EMPTY_MESSAGES: Record<FarmerStatus, string> = {
  pending: 'No hay solicitudes pendientes de revisar.',
  approved: 'Todavía no hay agricultores aceptados.',
  rejected: 'No hay agricultores rechazados ni suspendidos.'
};

type Feedback = { type: 'success' | 'error'; message: string };

export default function FarmerApplicationsPage() {
  const [records, setRecords] = useState<FarmerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<FarmerStatus>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<FarmerRecord | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const loadRecords = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await adminFarmerService.listRecords();
      setRecords(data);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'No se pudieron cargar los agricultores.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const counts = useMemo(
    () =>
      records.reduce(
        (acc, record) => ({ ...acc, [record.status]: acc[record.status] + 1 }),
        { pending: 0, approved: 0, rejected: 0 } as Record<FarmerStatus, number>
      ),
    [records]
  );

  const visibleRecords = useMemo(
    () => records.filter((record) => record.status === activeTab && matchesFarmerSearch(record, searchTerm)),
    [records, activeTab, searchTerm]
  );

  const changeStatus = async (record: FarmerRecord, nextStatus: FarmerStatus, reason?: string) => {
    try {
      setProcessingId(record.id);
      setModalError(null);

      if (nextStatus === 'approved') {
        await adminFarmerService.approve(record);
      } else {
        await adminFarmerService.reject(record, reason);
      }

      await loadRecords();

      setSelectedRecord(null);
      setActiveTab(nextStatus);
      setFeedback({
        type: 'success',
        message:
          nextStatus === 'approved'
            ? `${record.fullName} ya forma parte de los agricultores aceptados.`
            : `${record.fullName} se ha movido a rechazados.`
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo actualizar el estado.';
      setModalError(message);
      setFeedback({ type: 'error', message });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900">Agricultores</h1>
        <p className="text-gray-600">
          Revisa solicitudes, consulta la ficha completa y gestiona el acceso a la plataforma.
        </p>
      </header>

      {feedback && (
        <div
          className={`flex items-start justify-between gap-4 rounded-xl border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-primary/20 bg-primary/5 text-primary'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} aria-label="Cerrar aviso" className="font-bold leading-none">
            ×
          </button>
        </div>
      )}

      {loadError && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{loadError}</span>
          <button
            onClick={loadRecords}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <nav className="flex flex-wrap gap-1 rounded-xl bg-stone-100 p-1" aria-label="Filtrar por estado">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                title={tab.hint}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-primary text-white shadow-sm' : 'text-gray-600 hover:bg-white hover:text-primary'
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-white text-gray-500'
                  }`}
                >
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="relative lg:w-80">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar por nombre, email, negocio o provincia"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Agricultor
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Explotación
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Ubicación
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Estado
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                  Alta
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                  Ficha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleRecords.map((record) => (
                <tr
                  key={`${record.source}-${record.id}`}
                  onClick={() => {
                    setModalError(null);
                    setSelectedRecord(record);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setModalError(null);
                      setSelectedRecord(record);
                    }
                  }}
                  tabIndex={0}
                  className="cursor-pointer transition-colors hover:bg-primary/5 focus:bg-primary/5 focus:outline-none"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {`${record.firstName?.[0] ?? ''}${record.lastName?.[0] ?? ''}`.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-gray-900">{record.fullName}</div>
                        <div className="truncate text-sm text-gray-500">{record.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {record.businessName || 'Sin nombre comercial'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {getProductionTypeLabel(record.productionType)}
                      {record.hectares ? ` · ${record.hectares} ha` : ''}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                    {[record.city, record.province].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                        FARMER_STATUS_BADGE_CLASSES[record.status]
                      }`}
                    >
                      {FARMER_STATUS_LABELS[record.status]}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {formatFarmerDate(record.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-primary">
                    Ver detalles →
                  </td>
                </tr>
              ))}

              {visibleRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                    {searchTerm.trim()
                      ? `Ningún agricultor coincide con "${searchTerm.trim()}".`
                      : EMPTY_MESSAGES[activeTab]}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FarmerDetailsModal
        record={selectedRecord}
        isProcessing={processingId === selectedRecord?.id}
        errorMessage={modalError}
        onClose={() => {
          setSelectedRecord(null);
          setModalError(null);
        }}
        onApprove={(record) => changeStatus(record, 'approved')}
        onReject={(record, reason) => changeStatus(record, 'rejected', reason)}
      />
    </div>
  );
}
