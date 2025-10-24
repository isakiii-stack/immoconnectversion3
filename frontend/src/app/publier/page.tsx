'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Plus, Upload, X, Image } from 'lucide-react'
import Link from 'next/link'

export default function PublierPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    property_type: '',
    location: '',
    surface: '',
    rooms: '',
    images: [] as string[]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user, isAuthenticated } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation côté client
    if (!formData.title.trim()) {
      setError('Le titre est requis.')
      setLoading(false)
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Le prix doit être supérieur à 0.')
      setLoading(false)
      return
    }

    if (!formData.property_type) {
      setError('Le type de bien est requis.')
      setLoading(false)
      return
    }

    if (!formData.location.trim()) {
      setError('La localisation est requise.')
      setLoading(false)
      return
    }

    if (selectedImages.length === 0) {
      setError('Au moins une image est requise.')
      setLoading(false)
      return
    }

    try {
      // Upload images to Supabase Storage
      const uploadedImages: string[] = []
      
      for (const image of selectedImages) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `listings/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('listings')
          .upload(filePath, image)

        if (uploadError) {
          throw new Error(`Erreur lors de l'upload de l'image: ${uploadError.message}`)
        }

        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(filePath)

        uploadedImages.push(publicUrl)
      }

      // Save listing to database (version temporaire avec votre table actuelle)
      const { data, error } = await supabase
        .from('listings')
        .insert([{
          user_id: user?.id,
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          image_url: uploadedImages[0] || null // Utiliser la première image pour image_url
        }])
        .select()

      if (error) {
        throw new Error(`Erreur lors de la sauvegarde: ${error.message}`)
      }

      setSuccess('Annonce publiée avec succès !')
      setFormData({
        title: '',
        description: '',
        price: '',
        property_type: '',
        location: '',
        surface: '',
        rooms: '',
        images: []
      })
      setSelectedImages([])
      setImagePreviews([])
      
      // Redirect to listings page after 2 seconds
      setTimeout(() => {
        window.location.href = '/annonces'
      }, 2000)
      
    } catch (err: any) {
      console.error('Error publishing listing:', err)
      setError(err.message || 'Erreur lors de la publication de l\'annonce.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Vérifier le nombre maximum d'images (5)
    if (selectedImages.length + files.length > 5) {
      setError('Vous ne pouvez sélectionner que 5 images maximum')
      return
    }

    // Vérifier la taille des fichiers (5MB max par image)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError('Les images ne doivent pas dépasser 5MB')
      return
    }

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      setError('Seuls les formats JPEG, PNG et WebP sont acceptés')
      return
    }

    setError('')
    
    // Ajouter les nouvelles images
    const newImages = [...selectedImages, ...files]
    setSelectedImages(newImages)

    // Créer les aperçus
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index)
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    
    // Libérer l'URL de l'aperçu
    URL.revokeObjectURL(imagePreviews[index])
    
    setSelectedImages(newImages)
    setImagePreviews(newPreviews)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/" className="mr-4">
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Publier une annonce</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Se connecter
                </Link>
                <Link 
                  href="/signup" 
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connexion requise
            </h2>
            <p className="text-gray-600 mb-6">
              Vous devez être connecté pour publier une annonce
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                href="/login" 
                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
              >
                Se connecter
              </Link>
              <Link 
                href="/signup" 
                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Publier une annonce</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Informations de l'annonce</h2>
            <p className="text-sm text-gray-600">Remplissez les informations de votre bien immobilier</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
                {success}
              </div>
            )}

            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de l'annonce *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ex: Appartement 3 pièces avec balcon"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Décrivez votre bien en détail..."
              />
            </div>

            {/* Prix et Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Prix (DZD) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="25000000"
                />
              </div>

              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de bien *
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  required
                  value={formData.property_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="appartement">Appartement</option>
                  <option value="maison">Maison</option>
                  <option value="studio">Studio</option>
                  <option value="loft">Loft</option>
                  <option value="villa">Villa</option>
                </select>
              </div>
            </div>

            {/* Localisation et Surface */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Localisation *
                </label>
                <select
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sélectionnez une ville</option>
                  <optgroup label="Alger">
                    <option value="Alger, Hydra">Alger, Hydra</option>
                    <option value="Alger, El Biar">Alger, El Biar</option>
                    <option value="Alger, Ben Aknoun">Alger, Ben Aknoun</option>
                    <option value="Alger, Kouba">Alger, Kouba</option>
                    <option value="Alger, Bab Ezzouar">Alger, Bab Ezzouar</option>
                    <option value="Alger, Hussein Dey">Alger, Hussein Dey</option>
                    <option value="Alger, El Harrach">Alger, El Harrach</option>
                    <option value="Alger, Dar El Beida">Alger, Dar El Beida</option>
                  </optgroup>
                  <optgroup label="Oran">
                    <option value="Oran, Centre">Oran, Centre</option>
                    <option value="Oran, Sidi El Houari">Oran, Sidi El Houari</option>
                    <option value="Oran, Bir El Djir">Oran, Bir El Djir</option>
                    <option value="Oran, Es Senia">Oran, Es Senia</option>
                  </optgroup>
                  <optgroup label="Autres villes">
                    <option value="Annaba">Annaba</option>
                    <option value="Constantine">Constantine</option>
                    <option value="Blida">Blida</option>
                    <option value="Sétif">Sétif</option>
                    <option value="Tlemcen">Tlemcen</option>
                    <option value="Béjaïa">Béjaïa</option>
                    <option value="Batna">Batna</option>
                    <option value="Djelfa">Djelfa</option>
                    <option value="Sidi Bel Abbès">Sidi Bel Abbès</option>
                    <option value="Biskra">Biskra</option>
                    <option value="Tébessa">Tébessa</option>
                    <option value="El Oued">El Oued</option>
                    <option value="Skikda">Skikda</option>
                    <option value="Tiaret">Tiaret</option>
                    <option value="Guelma">Guelma</option>
                    <option value="Mostaganem">Mostaganem</option>
                    <option value="M'sila">M'sila</option>
                    <option value="Mascara">Mascara</option>
                    <option value="Ouargla">Ouargla</option>
                    <option value="Jijel">Jijel</option>
                    <option value="Relizane">Relizane</option>
                    <option value="Saïda">Saïda</option>
                    <option value="Médéa">Médéa</option>
                    <option value="Bordj Bou Arreridj">Bordj Bou Arreridj</option>
                    <option value="Chlef">Chlef</option>
                    <option value="Laghouat">Laghouat</option>
                    <option value="Aïn Defla">Aïn Defla</option>
                    <option value="Tipaza">Tipaza</option>
                    <option value="Mila">Mila</option>
                    <option value="Aïn Témouchent">Aïn Témouchent</option>
                    <option value="Ghardaïa">Ghardaïa</option>
                    <option value="Tamanrasset">Tamanrasset</option>
                    <option value="Adrar">Adrar</option>
                    <option value="Béchar">Béchar</option>
                    <option value="Tindouf">Tindouf</option>
                    <option value="Illizi">Illizi</option>
                    <option value="Tissemsilt">Tissemsilt</option>
                    <option value="Boumerdès">Boumerdès</option>
                    <option value="El Tarf">El Tarf</option>
                    <option value="Tizi Ouzou">Tizi Ouzou</option>
                    <option value="Bouira">Bouira</option>
                    <option value="Khenchela">Khenchela</option>
                    <option value="Souk Ahras">Souk Ahras</option>
                    <option value="El M'Ghair">El M'Ghair</option>
                    <option value="El Menia">El Menia</option>
                    <option value="Ouled Djellal">Ouled Djellal</option>
                    <option value="Bordj Badji Mokhtar">Bordj Badji Mokhtar</option>
                    <option value="Béni Abbès">Béni Abbès</option>
                    <option value="Timimoun">Timimoun</option>
                    <option value="Touggourt">Touggourt</option>
                    <option value="Djanet">Djanet</option>
                    <option value="In Salah">In Salah</option>
                    <option value="In Guezzam">In Guezzam</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label htmlFor="surface" className="block text-sm font-medium text-gray-700 mb-2">
                  Surface (m²)
                </label>
                <input
                  type="number"
                  id="surface"
                  name="surface"
                  value={formData.surface}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="75"
                />
              </div>
            </div>

            {/* Pièces */}
            <div>
              <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de pièces
              </label>
              <input
                type="number"
                id="rooms"
                name="rooms"
                value={formData.rooms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="3"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos (optionnel) - Maximum 5 images
              </label>
              
              {/* Input file caché */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              
              {/* Zone de sélection */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer"
                onClick={openFileDialog}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Cliquez pour sélectionner des photos ou glissez-déposez ici
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Formats acceptés: JPEG, PNG, WebP • Max 5MB par image • Max 5 images
                </p>
                <Button type="button" variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter des photos
                </Button>
              </div>

              {/* Aperçus des images sélectionnées */}
              {imagePreviews.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Images sélectionnées ({imagePreviews.length}/5)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Aperçu ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg">
                          {selectedImages[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Boutons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link href="/dashboard">
                <Button type="button" variant="ghost">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" variant="default" disabled={loading}>
                {loading ? 'Publication...' : 'Publier l\'annonce'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
