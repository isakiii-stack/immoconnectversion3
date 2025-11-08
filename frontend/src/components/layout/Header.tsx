'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, User, Heart, MessageCircle, Plus, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchModal } from '@/components/modals/SearchModal';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const navigation = [
    { name: 'Voir les annonces', href: '/annonces' },
    { name: 'Recherches', href: '/recherches' },
    { name: 'Comment ça marche', href: '/comment-ca-marche' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="ImmoConnect" 
                className="h-12 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Download App Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Télécharger l'APK
                  const link = document.createElement('a');
                  link.href = '/app/immoconnect.apk';
                  link.download = 'ImmoConnect.apk';
                  link.click();
                }}
                className="text-primary-600 border-primary-600 hover:bg-primary-50"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden lg:inline">Télécharger l'app</span>
                <span className="lg:hidden">App</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Search className="w-4 h-4 mr-2" />
                Rechercher
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/messages">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Messages
                    </Link>
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/favoris">
                      <Heart className="w-4 h-4 mr-2" />
                      Favoris
                    </Link>
                  </Button>
                  
                  <Button variant="default" size="sm" asChild>
                    <Link href="/publier">
                      <Plus className="w-4 h-4 mr-2" />
                      Publier
                    </Link>
                  </Button>
                  
                  <UserMenu user={user} />
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Se connecter</Link>
                  </Button>
                  <Button variant="default" asChild>
                    <Link href="/signup">S'inscrire</Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600'
                        : 'text-gray-700 hover:text-primary-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  {/* Download App Button Mobile */}
                  <Button
                    variant="outline"
                    className="justify-start mb-3 text-primary-600 border-primary-600 hover:bg-primary-50"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = '/app/immoconnect.apk';
                      link.download = 'ImmoConnect.apk';
                      link.click();
                      setIsMenuOpen(false);
                    }}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Télécharger l'app
                  </Button>

                  {isAuthenticated ? (
                    <div className="flex flex-col space-y-3">
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/messages">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Messages
                        </Link>
                      </Button>
                      
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/favoris">
                          <Heart className="w-4 h-4 mr-2" />
                          Favoris
                        </Link>
                      </Button>
                      
                      <Button variant="default" asChild className="justify-start">
                        <Link href="/publier">
                          <Plus className="w-4 h-4 mr-2" />
                          Publier
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-3">
                      <Button variant="ghost" asChild className="justify-start">
                        <Link href="/login">Se connecter</Link>
                      </Button>
                      <Button variant="default" asChild className="justify-start">
                        <Link href="/signup">S'inscrire</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
