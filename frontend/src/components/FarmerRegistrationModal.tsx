'use client';
import { useState } from 'react';

interface FarmerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FarmerRegistrationModal({ isOpen, onClose }: FarmerRegistrationModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    nombreNegocio: '',
    email: '',
    telefono: '',
    direccion: '',
    codigoPostal: '',
    ciudad: '',
    provincia: '',
    tipoProduccion: 'tradicional',
    productos: '',
    descripcion: '',
    certificaciones: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de envío del formulario
    console.log('Datos del formulario:', formData);
    // Simular éxito y cerrar
    alert('Gracias por tu registro. Nos pondremos en contacto contigo pronto.');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <div 
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-primary text-white px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Registro de Agricultor</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-accent transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="mt-2 text-sm opacity-90">
                Únete a nuestra comunidad de productores locales
              </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Información Personal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre*
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      required
                      value={formData.nombre}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos*
                    </label>
                    <input
                      type="text"
                      name="apellidos"
                      required
                      value={formData.apellidos}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Tus apellidos"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono*
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      required
                      value={formData.telefono}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                {/* Información del Negocio */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Negocio</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Negocio
                    </label>
                    <input
                      type="text"
                      name="nombreNegocio"
                      value={formData.nombreNegocio}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Nombre de tu negocio o finca"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Producción*
                    </label>
                    <select
                      name="tipoProduccion"
                      required
                      value={formData.tipoProduccion}
                      onChange={handleChange}
                      className="input-field"
                    >
                      <option value="tradicional">Agricultura Tradicional</option>
                      <option value="ecologica">Agricultura Ecológica</option>
                      <option value="biodinamica">Agricultura Biodinámica</option>
                      <option value="integrada">Agricultura Integrada</option>
                      <option value="artesanal">Producción Artesanal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Productos Principales*
                    </label>
                    <input
                      type="text"
                      name="productos"
                      required
                      value={formData.productos}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: Tomates, Aceite de Oliva, Miel..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certificaciones
                    </label>
                    <input
                      type="text"
                      name="certificaciones"
                      value={formData.certificaciones}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Ej: Ecológico, D.O.P., IGP..."
                    />
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="mt-4 sm:mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dirección</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección*
                    </label>
                    <input
                      type="text"
                      name="direccion"
                      required
                      value={formData.direccion}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Calle, número..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal*
                    </label>
                    <input
                      type="text"
                      name="codigoPostal"
                      required
                      value={formData.codigoPostal}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="00000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad*
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      required
                      value={formData.ciudad}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Tu ciudad"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia*
                    </label>
                    <input
                      type="text"
                      name="provincia"
                      required
                      value={formData.provincia}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="Tu provincia"
                    />
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuéntanos más sobre tu producción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={4}
                  className="input-field"
                  placeholder="Describe tu experiencia, métodos de producción, historia..."
                />
              </div>

              {/* Botones de acción */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
