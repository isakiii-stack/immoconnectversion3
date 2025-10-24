import { Star, Quote } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Acheteuse',
      location: 'Paris, France',
      content: 'Grâce à ImmoConnect, j\'ai trouvé mon appartement idéal en publiant ma recherche. Les vendeurs m\'ont contactée directement !',
      rating: 5,
      avatar: '/avatars/marie.jpg'
    },
    {
      name: 'Jean Martin',
      role: 'Vendeur',
      location: 'Lyon, France',
      content: 'Vendre ma maison n\'a jamais été aussi simple. Les acheteurs intéressés me contactent directement via la plateforme.',
      rating: 5,
      avatar: '/avatars/jean.jpg'
    },
    {
      name: 'Sophie Leroy',
      role: 'Investisseur',
      location: 'Marseille, France',
      content: 'La messagerie intégrée et les notifications en temps réel m\'ont permis de conclure plusieurs transactions rapidement.',
      rating: 5,
      avatar: '/avatars/sophie.jpg'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les témoignages de nos utilisateurs qui ont transformé 
            leur expérience immobilière avec ImmoConnect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                </div>
                
                <Quote className="w-8 h-8 text-primary-200 mb-4" />
                
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-600 font-semibold text-lg">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 max-w-4xl mx-auto shadow-sm">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt à rejoindre nos utilisateurs satisfaits ?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Rejoignez des milliers d'utilisateurs qui ont déjà trouvé leur propriété 
              ou vendu leur bien grâce à ImmoConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Commencer gratuitement
              </a>
              <a
                href="/temoignages"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Lire plus de témoignages
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
