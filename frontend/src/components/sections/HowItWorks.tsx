import { Home, Users, MessageCircle, CheckCircle } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: Home,
      title: 'Annonces classiques',
      description: 'Les vendeurs publient leurs biens immobiliers avec photos, prix et détails.',
      features: ['Photos haute qualité', 'Descriptions détaillées', 'Prix et surface', 'Localisation précise']
    },
    {
      icon: Users,
      title: 'Annonces inversées',
      description: 'Les acheteurs publient leurs critères de recherche et les vendeurs les contactent.',
      features: ['Budget défini', 'Critères précis', 'Localisation souhaitée', 'Contact direct']
    },
    {
      icon: MessageCircle,
      title: 'Messagerie intégrée',
      description: 'Communication sécurisée entre acheteurs et vendeurs en temps réel.',
      features: ['Chat en temps réel', 'Notifications', 'Historique des conversations', 'Sécurisé']
    },
    {
      icon: CheckCircle,
      title: 'Transactions sécurisées',
      description: 'Processus de vente sécurisé avec suivi des étapes et validation.',
      features: ['Suivi des étapes', 'Validation des documents', 'Paiement sécurisé', 'Support client']
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            ImmoConnect révolutionne l'immobilier avec deux types d'annonces 
            pour une expérience complète et bidirectionnelle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary-200 transition-colors">
                  <step.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {step.description}
              </p>
              
              <ul className="text-sm text-gray-500 space-y-1">
                {step.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-success-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-primary-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Prêt à commencer ?
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Rejoignez des milliers d'utilisateurs qui ont déjà trouvé leur propriété idéale 
              ou vendu leur bien sur ImmoConnect.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Créer un compte gratuit
              </a>
              <a
                href="/comment-ca-marche"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
