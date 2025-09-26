'use client';
import { useState } from 'react';
import { farmerApplicationApi, FarmerApplicationData } from '@/lib/farmerApplicationApi';

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
    tipoProduccion: 'conventional',
    productos: '',
    descripcion: '',
    certificaciones: '',
    experiencia: '1',
    hectareas: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const applicationData: FarmerApplicationData = {
        first_name: formData.nombre,
        last_name: formData.apellidos,
        email: formData.email,
        phone: formData.telefono,
        business_name: formData.nombreNegocio || undefined,
        address: formData.direccion,
        postal_code: formData.codigoPostal,
        city: formData.ciudad,
        province: formData.provincia,
        farming_experience: parseInt(formData.experiencia),
        hectares: formData.hectareas ? parseFloat(formData.hectareas) : undefined,
        production_type: formData.tipoProduccion as 'organic' | 'conventional' | 'integrated',
        main_products: formData.productos.split(',').map(p => p.trim()).filter(p => p).join(', '),
        description: formData.descripcion,
        certifications: formData.certificaciones ? formData.certificaciones : undefined,
      };

      await farmerApplicationApi.submit(applicationData);
      
      // Mostrar mensaje de éxito más visible
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-[9999]';
      successMessage.innerHTML = `
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          ¡Solicitud enviada con éxito!
        </div>
        <p class="mt-1 text-sm">Te contactaremos pronto para revisar tu aplicación.</p>
      `;
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 5000);
      
      onClose();
      
      // Reset form
      setFormData({
        nombre: '',
        apellidos: '',
        nombreNegocio: '',
        email: '',
        telefono: '',
        direccion: '',
        codigoPostal: '',
        ciudad: '',
        provincia: '',
        tipoProduccion: 'conventional',
        productos: '',
        descripcion: '',
        certificaciones: '',
        experiencia: '1',
        hectareas: '',
      });
    } catch (error) {
      console.error('Error submitting farmer application:', error);
      setSubmitError('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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

            {/* Error Message */}
            {submitError && (
              <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Error:</span>
                </div>
                <p className="mt-1">{submitError}</p>
              </div>
            )}

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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-gray-900 bg-white"
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
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-6 py-2 font-medium rounded-lg transition-colors flex items-center justify-center ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-accent text-white hover:bg-accent/90'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    'Enviar Solicitud'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
