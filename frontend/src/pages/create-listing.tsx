import { Building2, ImagePlus, MapPin, Upload } from 'lucide-react';
import { useState, useEffect  } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ProgressSteps } from '../components/ui/progress-steps';
import axios from "axios";
import os from 'os';


interface ListingFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  street_name: string;
  zip_code: string;
  road_name: string;
  town: string;
  city: string;
  block: string;
  longitude: number;
  latitude: number;
  coordinates: [number, number];
  type: string;
  size: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: File[];
  videoUrl?: string;
  status: 'available' | 'rented' | 'sold';
}

interface FormErrors extends Partial<Record<keyof ListingFormData, string>> {
  submit?: string;
}

const PROPERTY_TYPES = ['HDB', 'Condo', 'Landed', 'Apartment', 'Penthouse', 'Studio'];
const AMENITIES = [
  'Air Conditioning',
  'Swimming Pool',
  'Gym',
  'Parking',
  'Security',
  'Balcony',
  'Garden',
  'Smart Home',
  'Pet Friendly',
  'Washing Machine',
  'Dryer',
  'Wi-Fi',
  'Kitchen',
];

const PROPERTY_STATUS = [
  { value: 'available', label: 'Available' },
  { value: 'rented', label: 'Rented' },
  { value: 'sold', label: 'Sold' },
] as const;

const STEPS = [
  'Basic Information',
  'Location & Pricing',
  'Photos & Media',
  'Review & Submit'
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [postalCode, setPostalCode] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [formData, setFormData] = useState<ListingFormData>({
    title: '',
    description: '',
    price: 0,
    location: '',
    zip_code: '',
    block: '',
    road_name: '',
    street_name: '',
    town: '',
    city: '',
    longitude: 0,
    latitude: 0,
    coordinates: [1.3521, 103.8198], // Default to Singapore coordinates
    type: '',
    size: 0,
    bedrooms: 1,
    bathrooms: 1,
    amenities: [],
    images: [],
    status: 'available',
  });
  const SINGAPORE_TOWNS = [
    'Ang Mo Kio', 'Bedok', 'Bishan', 'Bukit Batok', 'Bukit Merah', 'Bukit Panjang',
    'Bukit Timah', 'Central Area', 'Choa Chu Kang', 'Clementi', 'Geylang', 'Hougang',
    'Jurong East', 'Jurong West', 'Kallang/Whampoa', 'Marine Parade', 'Pasir Ris',
    'Punggol', 'Queenstown', 'Sembawang', 'Sengkang', 'Serangoon', 'Tampines',
    'Toa Payoh', 'Woodlands', 'Yishun'
  ];

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]); // New state for image previews

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      console.log('Token:', token);
      if (!token) {
        console.error('No Token');
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/property/api/auth/verify/', { // change 
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('authToken');
          navigate('/login', { state: { from: location.pathname } });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/login');
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [navigate, location, imagePreviews]);
  
  const validateStep = (step: number) => {
    const newErrors: Partial<Record<keyof ListingFormData, string>> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 50)
          newErrors.description = 'Description must be at least 50 characters';
        if (!formData.type) newErrors.type = 'Property type is required';
        break;
      case 2:
        if (!formData.price || formData.price <= 0)
          newErrors.price = 'Price must be greater than 0';
        if (!formData.block.trim()) newErrors.block = 'Block number is required';
        if (!formData.road_name.trim()) newErrors.road_name = 'Street name is required';
        if (formData.size <= 0) newErrors.size = 'Size must be greater than 0';
        if (!formData.town) newErrors.town = 'You must select an area';
        break;
      case 3:
        if (formData.images.length === 0)
          newErrors.images = 'At least one image is required';
        if (formData.images.length > 10)
          newErrors.images = 'Maximum 10 images allowed';
        if (formData.videoUrl && formData.videoUrl.trim() !== '') {
          try {
            const url = new URL(formData.videoUrl);
            const isValidVideoUrl = 
              url.hostname.includes('youtube.com') || 
              url.hostname.includes('youtu.be') ||
              url.hostname.includes('vimeo.com');
            if (!isValidVideoUrl) {
              newErrors.videoUrl = 'Please enter a valid YouTube or Vimeo URL';
            }
          } catch {
            newErrors.videoUrl = 'Please enter a valid URL';
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
        return;
      }
      if ((currentStep < 4)) {
        // setCurrentStep((prev) => prev + 1);
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    if (currentStep != 4) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      try {
        // const url = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${formData.location}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
        
        formData.location = `${formData.block} ${formData.road_name}`;
        console.log('Location:', formData.location);
        const response = await axios.get(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${formData.location}&returnGeom=Y&getAddrDetails=Y&pageNum=1`);
        const data = response.data;
        if (data.results && data.results.length > 0) {
          const { POSTAL, BLK_NO, ROAD_NAME, LONGITUDE, LATITUDE, ADDRESS } = data.results[0];
          formData.zip_code = POSTAL;
          formData.block = BLK_NO;
          formData.road_name = ROAD_NAME;
          formData.longitude = LONGITUDE;
          formData.latitude = LATITUDE;
          formData.location = ADDRESS;
        }
      } catch (error) {
        console.error("Error fetching location code:", error);
      }

      console.log('Address:', formData.location);
      const propertyData = {
        title: formData.title,
        street_name: formData.road_name,
        town: formData.town,
        city: 'Singapore',
        location: formData.location,
        longitude: formData.longitude,
        latitude: formData.latitude,
        zip_code: formData.zip_code,
        description: formData.description,
        block: formData.block,
        price: formData.price,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        square_feet: formData.size,
        property_type: formData.type,
        amenities: formData.amenities.join(', '),
        status: formData.status,
      };

      const response = await fetch('http://127.0.0.1:8000/property/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create property');
      }

      const property = await response.json();
      if (formData.images.length > 0) {
        const formDataImages = new FormData();
        formData.images.forEach((file) => {
          formDataImages.append('images', file);
        });

        const imagesResponse = await fetch(`http://127.0.0.1:8000/property/details/${property.id}/images/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`
          },
          body: formDataImages
        });

        if (!imagesResponse.ok) {
          throw new Error('Property created but failed to upload images');
        }
      }
      navigate('/my-listings')
    } catch (error) {
      console.error('Error:', error);
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to create listing'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
  
    if (files.length + formData.images.length > 10) {
      setErrors(prev => ({ ...prev, images: 'Maximum 10 images allowed' }));
      return;
    }
  
    const newPreviews = files.map(file => URL.createObjectURL(file));
  
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  
    setImagePreviews(prev => [...prev, ...newPreviews]);
  
    setErrors(prev => ({ ...prev, images: undefined }));
  };
  

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imagePreviews[index]);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-center text-3xl font-bold dark:text-white">Create New Listing</h1>
            <p className="mt-2 text-center text-gray-600 dark:text-gray-400">Fill in the details below to create your property listing</p>
          </div>
          <div className="mb-12"><ProgressSteps steps={STEPS} currentStep={currentStep - 1}/></div>
          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
            <form onSubmit={currentStep === 4 ? handleSubmit : (e) => e.preventDefault()} className="p-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="border-b pb-4 dark:border-gray-700">
                    <h2 className="text-xl font-semibold dark:text-white">{STEPS[currentStep - 1]}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start with the basic details about your property</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Title</label>
                    <input type="text" value={formData.title}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, title: e.target.value }));
                        if (errors.title) validateStep(1);
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="e.g., Modern Condo in Orchard"/>
                    {errors.title && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Type</label>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {PROPERTY_TYPES.map((type) => (
                        <button key={type} type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, type }));
                            if (errors.type) validateStep(1);
                          }}
                          className={`flex h-24 flex-col items-center justify-center rounded-lg border p-4 transition-colors dark:border-gray-600 ${
                            formData.type === type
                              ? 'border-blue-500 bg-blue-50 text-blue-500 dark:border-blue-400 dark:bg-blue-900/50 dark:text-blue-400'
                              : 'border-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <Building2 className="mb-2 h-6 w-6" />
                          <span className="text-sm font-medium">{type}</span>
                        </button>
                      ))}
                    </div>
                    {errors.type && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.type}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <textarea value={formData.description}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, description: e.target.value }));
                        if (errors.description) validateStep(1);
                      }}
                      rows={4}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="Describe your property in detail..."/>
                    {errors.description && (<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>)}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Minimum 50 characters. Include key features, recent renovations, and nearby amenities.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Listing Status</label>
                    <select value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.value as ListingFormData['status'],
                        }))
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      {PROPERTY_STATUS.map((status) => (<option key={status.value} value={status.value}>{status.label}</option>))}
                    </select>
                  </div>
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="border-b pb-4 dark:border-gray-700">
                    <h2 className="text-xl font-semibold dark:text-white">{STEPS[currentStep - 1]}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Set your property's location and pricing details</p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Monthly Rent</label>
                      <div className="mt-1 flex items-center">
                        <span className="text-gray-500 dark:text-gray-400">$</span>
                        <input type="number" value={formData.price}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, price: Number(e.target.value) }));
                            if (errors.price) validateStep(2);
                          }}
                          min="0"
                          step="100"
                          className="ml-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      {errors.price && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Size (sqft)</label>
                      <input type="number" value={formData.size}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, size: Number(e.target.value) }));
                          if (errors.size) validateStep(2);
                        }}
                        min="0"
                        step="10"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      />
                      {errors.size && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.size}</p>}
                    </div>
                  </div>
                  <div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Block Number</label>
                      <input type="text" value={formData.block}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, block: e.target.value }));
                          if (errors.block) validateStep(2);
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g. 123"/>
                      {errors.block && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.block}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Street Name</label>
                      <input type="text" value={formData.road_name}
                        onChange={(e) => {
                          setFormData((prev) => ({ ...prev, road_name: e.target.value }));
                          if (errors.road_name) validateStep(2);
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="e.g. Hougang Ave 1"/>
                      {errors.road_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.road_name}</p>}
                    </div>
                  </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area</label>
                      <select value={formData.town} onChange={(e) => setFormData((prev) => ({ ...prev, town: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <option value="">Select the area</option>
                        {SINGAPORE_TOWNS.map((town) => (<option key={town} value={town}>{town}</option>))}
                        {!formData.town && (<option value="" disabled>Please select an area</option>)}
                      </select>
                    {errors.town && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.town}</p>}
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
                      <select value={formData.bedrooms}
                        onChange={(e) => setFormData((prev) => ({ ...prev, bedrooms: Number(e.target.value) }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        {[1, 2, 3, 4, 5].map((num) => (<option key={num} value={num}>{num} {num === 1 ? 'Bedroom' : 'Bedrooms'}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
                      <select value={formData.bathrooms} onChange={(e) => setFormData((prev) => ({ ...prev, bathrooms: Number(e.target.value) }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        {[1, 2, 3, 4].map((num) => ( <option key={num} value={num} > {num} {num === 1 ? 'Bathroom' : 'Bathrooms'}</option>))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amenities</label>
                    <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {AMENITIES.map((amenity) => (
                        <label key={amenity} className="flex items-center space-x-2">
                          <input type="checkbox" checked={formData.amenities.includes(amenity)}
                            onChange={(e) => { setFormData((prev) => ({
                                ...prev,
                                amenities: e.target.checked
                                  ? [...prev.amenities, amenity]
                                  : prev.amenities.filter((a) => a !== amenity),
                              }));
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"/>
                          <span className="text-sm dark:text-gray-300">{amenity}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="border-b pb-4 dark:border-gray-700">
                    <h2 className="text-xl font-semibold dark:text-white">{STEPS[currentStep - 1]}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add photos and videos to showcase your property</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Property Photos</label>
                    <div className="mt-2">
                      <div className="flex items-center justify-center">
                        <label className="group relative flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500">
                          <div className="space-y-1 text-center">
                            <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">Upload photos</span>{' '}or drag and drop
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB each</p>
                          </div>
                          <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload}/>
                        </label>
                      </div>
                      {errors.images && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.images}</p>}
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Upload up to 10 high-quality images. First image will be the main listing photo.</p>
                    </div>
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative aspect-square">
                            <img src={preview} alt={`Property preview ${index + 1}`} className="h-full w-full rounded-lg object-contain"/>
                            <button type="button" onClick={() => removeImage(index)}
                              className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600">
                              <Upload className="h-4 w-4 rotate-45"/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video URL (Optional)</label>
                    <input type="url" value={formData.videoUrl || ''}
                      onChange={(e) => { setFormData((prev) => ({ ...prev, videoUrl: e.target.value }));
                        if (errors.videoUrl) validateStep(3);
                      }}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                      placeholder="e.g., YouTube or Vimeo URL"/>
                    {errors.videoUrl && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.videoUrl}</p>}
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Add a video tour of your property (YouTube or Vimeo links only)</p>
                  </div>
                </div>
              )}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="border-b pb-4 dark:border-gray-700">
                    <h2 className="text-xl font-semibold dark:text-white">{STEPS[currentStep - 1]}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review your listing details before publishing</p>
                  </div>
                  <div className="rounded-lg border bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                    <h2 className="mb-4 text-xl font-semibold dark:text-white">{formData.title}</h2>
                    {imagePreviews.length > 0 && (
                      <div className="mb-4 overflow-hidden rounded-lg">
                        <img src={imagePreviews[0]} alt="Main property image" className="h-64 w-full object-contain"/>
                      </div>
                    )}
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium dark:text-white">Price:</span>{' '}
                        <span className="dark:text-gray-300">${formData.price}/month</span>
                      </div>
                      <div>
                        <span className="font-medium dark:text-white">Type:</span>{' '}
                        <span className="dark:text-gray-300">{formData.type}</span>
                      </div>
                      <div>
                        <span className="font-medium dark:text-white">Size:</span>{' '}
                        <span className="dark:text-gray-300">{formData.size} sqft</span>
                      </div>
                      <div>
                        <span className="font-medium dark:text-white">Location:</span>{' '}
                        <span className="dark:text-gray-300">{formData.block} {formData.road_name}</span>
                      </div>
                      <div>
                        <span className="font-medium dark:text-white">Bedrooms:</span>{' '}
                        <span className="dark:text-gray-300">{formData.bedrooms}</span>
                      </div>
                      <div>
                        <span className="font-medium dark:text-white">Bathrooms:</span>{' '}
                        <span className="dark:text-gray-300">{formData.bathrooms}</span>
                      </div>
                      <div>
                        <span className="font-medium dark:text-white">Status:</span>{' '}
                        <span className="dark:text-gray-300">{formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="font-medium dark:text-white">Description:</span>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">{formData.description}</p>
                    </div>
                    <div>
                      <span className="font-medium dark:text-white">Amenities:</span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {formData.amenities.map((amenity) => (
                          <span key={amenity}
                            className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-8 flex items-center justify-between border-t pt-6 dark:border-gray-700">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={handleBack} className="px-6">Back</Button>
                )}
                {currentStep < 4 && (
                  <Button type="button" onClick={handleNext} className={`px-6 ${currentStep === 1 ? 'ml-auto' : ''}`}>Continue</Button>
                )}
                {currentStep == 4 && (
                  // <Button type="submit" className="ml-auto px-6" disabled={isSubmitting} onClick={() => navigate('/my-listings')}>
                  // {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                  // </Button>
                  <Button type='submit' className='ml-auto px-6' onClick={(handleSubmit)} disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing...' : 'Publish Listing'}
                  </Button>
                )}
              </div>
              {errors.submit && ( <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{errors.submit}</p> )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}