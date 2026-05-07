'use client';

import React, { PropsWithChildren, useRef } from 'react';

/**
 * ClientLayoutWrapper
 *
 * Este wrapper garantiza un único boundary de cliente para layouts/árboles
 * que dependen de estado global (providers en cliente), evitando recreaciones
 * innecesarias del subárbol al re-renderizar.
 */
export default function ClientLayoutWrapper({
  children,
}: PropsWithChildren) {
  const stableNodeRef = useRef<React.ReactNode>(children);

  // Mantiene una referencia estable al primer árbol renderizado para evitar
  // reinicializaciones de estado global por cambios de identidad del nodo.
  if (stableNodeRef.current === undefined || stableNodeRef.current === null) {
    stableNodeRef.current = children;
  }

  return <>{stableNodeRef.current}</>;
}