import { Home, Users, MessageCircle, TrendingUp } from 'lucide-react';

export function Stats() {
  const stats = [
    {
      icon: Home,
      value: '10,000+',
      label: 'Biens immobiliers',
      description: 'Annonces actives sur la plateforme'
    },
    {
      icon: Users,
      value: '5,000+',
      label: 'Recherches d\'acheteurs',
      description: 'Demandes publiées par des acheteurs'
    },
    {
      icon: MessageCircle,
      value: '50,000+',
      label: 'Messages échangés',
      description: 'Conversations entre utilisateurs'
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Taux de satisfaction',
      description: 'Utilisateurs satisfaits de la plateforme'
    }
  ];

  return (
    <section className="py-20 bg-primary-600">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            ImmoConnect en chiffres
          </h2>
          <p className="text-xl text-primary-100 max-w-3xl mx-auto">
            Une plateforme qui grandit avec ses utilisateurs et qui transforme 
            l'expérience immobilière.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-opacity-30 transition-all">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="text-4xl font-bold text-white mb-2">
                {stat.value}
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-2">
                {stat.label}
              </h3>
              
              <p className="text-primary-100 text-sm">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Rejoignez la communauté ImmoConnect
            </h3>
            <p className="text-lg text-primary-100 mb-6">
              Plus de 25,000 utilisateurs nous font confiance pour leurs transactions immobilières.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Commencer maintenant
              </a>
              <a
                href="/temoignages"
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
              >
                Voir les témoignages
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
