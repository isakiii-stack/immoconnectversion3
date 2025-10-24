import { ArrowRight, Home, Users } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
      <div className="container-custom">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à transformer votre{' '}
            <span className="text-primary-200">expérience immobilière</span> ?
          </h2>
          
          <p className="text-xl text-primary-100 mb-12 max-w-3xl mx-auto">
            Rejoignez ImmoConnect dès aujourd'hui et découvrez une nouvelle façon 
            de vendre, acheter ou louer des biens immobiliers.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            <div className="bg-white bg-opacity-10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Vous vendez un bien ?
              </h3>
              <p className="text-primary-100 mb-6">
                Publiez votre annonce et recevez des messages d'acheteurs intéressés.
              </p>
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Publier une annonce
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>

            <div className="bg-white bg-opacity-10 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Vous cherchez un bien ?
              </h3>
              <p className="text-primary-100 mb-6">
                Publiez votre recherche et laissez les vendeurs vous contacter.
              </p>
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Publier une recherche
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>

          <div className="bg-white bg-opacity-10 rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Inscription gratuite et sans engagement
            </h3>
            <p className="text-primary-100 mb-6">
              Créez votre compte en quelques minutes et commencez à utiliser 
              ImmoConnect immédiatement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-primary-600 font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Créer un compte gratuit
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
              <a
                href="/comment-ca-marche"
                className="inline-flex items-center justify-center px-8 py-3 border border-white text-white font-medium rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
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
