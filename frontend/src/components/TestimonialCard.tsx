import Image from 'next/image';

interface TestimonialCardProps {
  name: string;
  role: string;
  imageUrl: string;
  testimonial: string;
}

export default function TestimonialCard({ name, role, imageUrl, testimonial }: TestimonialCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">"{testimonial}"</p>
    </div>
  );
} 