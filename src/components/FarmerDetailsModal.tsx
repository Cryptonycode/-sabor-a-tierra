'use client';

import React, { useEffect, useState } from 'react';
import {
  FARMER_STATUS_BADGE_CLASSES,
  FARMER_STATUS_LABELS,
  formatFarmerDate,
  getProductionTypeLabel
} from '@/lib/farmerRecords';
import type { FarmerRecord } from '@/types/farmer';

interface FarmerDetailsModalProps {
  record: FarmerRecord | null;
  isProcessing: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onApprove: (record: FarmerRecord) => void;
  onReject: (record: FarmerRecord, reason: string) => void;
}

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 break-words">{value || '—'}</dd>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-gray-200 bg-white p-5">
    <h4 className="mb-4 text-sm font-bold text-primary">{title}</h4>
    {children}
  </section>
);

const TagList = ({ items }: { items: string[] }) => {
  if (items.length === 0) return <span className="text-sm text-gray-500">—</span>;

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {item}
        </span>
      ))}
    </div>
  );
};

export default function FarmerDetailsModal({
  record,
  isProcessing,
  errorMessage,
  onClose,
  onApprove,
  onReject
}: FarmerDetailsModalProps) {
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setShowRejectionForm(false);
    setRejectionReason('');
  }, [record?.id]);

  useEffect(() => {
    if (!record) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [record, onClose]);

  if (!record) return null;

  const canApprove = record.status !== 'approved';
  const canReject = record.status !== 'rejected';
  const rejectLabel = record.status === 'approved' ? 'Suspender agricultor' : 'Rechazar solicitud';
  const initials = `${record.firstName?.[0] ?? ''}${record.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha de ${record.fullName}`}
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-stone-50 shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 bg-primary px-6 py-5 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-xl font-bold">{record.fullName}</h3>
              <p className="truncate text-sm text-white/80">
                {record.businessName || 'Sin nombre comercial'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                    FARMER_STATUS_BADGE_CLASSES[record.status]
                  }`}
                >
                  {FARMER_STATUS_LABELS[record.status]}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
                  {record.source === 'application' ? 'Solicitud' : 'Ficha de agricultor'}
                </span>
                {record.verified && (
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">Verificado</span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-lg leading-none transition-colors hover:bg-white/25"
          >
            ×
          </button>
        </header>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Section title="Contacto">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Email" value={<a href={`mailto:${record.email}`} className="text-primary hover:underline">{record.email}</a>} />
                <Field label="Teléfono" value={record.phone} />
                <Field
                  label="Web"
                  value={
                    record.website ? (
                      <a href={record.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {record.website}
                      </a>
                    ) : null
                  }
                />
                <Field label="Redes sociales" value={record.socialMedia} />
              </dl>
            </Section>

            <Section title="Ubicación">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Dirección" value={record.address} />
                <Field label="Código postal" value={record.postalCode} />
                <Field label="Ciudad" value={record.city} />
                <Field label="Provincia" value={record.province} />
              </dl>
            </Section>

            <Section title="Explotación">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tipo de producción" value={getProductionTypeLabel(record.productionType)} />
                <Field
                  label="Experiencia"
                  value={record.yearsExperience != null ? `${record.yearsExperience} años` : null}
                />
                <Field label="Hectáreas" value={record.hectares != null ? `${record.hectares} ha` : null} />
                <Field label="Alta en el sistema" value={formatFarmerDate(record.createdAt)} />
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Especialidades</dt>
                  <dd className="mt-1.5">
                    <TagList items={record.specialties} />
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">Certificaciones</dt>
                  <dd className="mt-1.5">
                    <TagList items={record.certifications} />
                  </dd>
                </div>
              </dl>
            </Section>

            <Section title="Descripción">
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">
                {record.description || 'El agricultor no ha aportado descripción.'}
              </p>
            </Section>
          </div>

          {(record.rejectionReason || record.notes || record.approvedAt) && (
            <Section title="Historial de revisión">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fecha de aprobación" value={formatFarmerDate(record.approvedAt)} />
                <Field label="Motivo del rechazo" value={record.rejectionReason} />
                {record.notes && <Field label="Notas internas" value={record.notes} />}
              </dl>
            </Section>
          )}
        </div>

        <footer className="space-y-3 border-t border-gray-200 bg-white px-6 py-4">
          {errorMessage && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          )}

          {showRejectionForm ? (
            <div className="space-y-3">
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                Motivo del rechazo <span className="font-normal text-gray-500">(opcional, se guarda en la solicitud)</span>
              </label>
              <textarea
                id="rejection-reason"
                rows={2}
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Ej.: la documentación aportada no acredita la producción ecológica."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRejectionForm(false)}
                  disabled={isProcessing}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onReject(record, rejectionReason.trim())}
                  disabled={isProcessing}
                  className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar rechazo'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cerrar
              </button>

              {canReject && (
                <button
                  onClick={() => setShowRejectionForm(true)}
                  disabled={isProcessing}
                  className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
                >
                  {rejectLabel}
                </button>
              )}

              {canApprove && (
                <button
                  onClick={() => onApprove(record)}
                  disabled={isProcessing}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {isProcessing
                    ? 'Procesando...'
                    : record.status === 'rejected'
                      ? 'Reactivar y aceptar'
                      : 'Aceptar agricultor'}
                </button>
              )}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
