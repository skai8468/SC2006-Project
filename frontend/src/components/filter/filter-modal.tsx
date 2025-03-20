import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { PROPERTIES } from "@/data/properties";
import { Button } from "../ui/button";
import { FilterSection } from "./filter-section";
import { PriceRangeSlider } from "./price-range-slider";
import { PropertyTypeSelector } from "./property-type-selector";
import { RoomCounter } from "./room-counter";

export interface FilterValues {
  propertyTypes: string[];
  priceRange: [number, number];
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  placeType: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
}

const PLACE_TYPES = ["Entire Place", "Private Room", "Shared Room"];
const PROPERTY_TYPES = [
  "HDB",
  "Condo",
  "Landed",
  "Apartment",
  "Penthouse",
  "Studio",
];
const AMENITIES = [
  "Air Conditioning",
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security",
  "Balcony",
  "Garden",
  "Smart Home",
  "Pet Friendly",
  "Washing Machine",
  "Dryer",
  "Wi-Fi",
  "Kitchen",
];

export function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterValues>({
    propertyTypes: [],
    priceRange: [0, 10000],
    bedrooms: 0,
    bathrooms: 0,
    amenities: [],
    placeType: [],
  });

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [filteredCount, setFilteredCount] = useState(PROPERTIES.length);
  const displayedAmenities = showAllAmenities
    ? AMENITIES
    : AMENITIES.slice(0, 6);

  // Calculate filtered properties count whenever filters change
  useEffect(() => {
    const count = PROPERTIES.filter((property) => {
      if (
        filters.propertyTypes.length > 0 &&
        !filters.propertyTypes.includes(property.type)
      ) {
        return false;
      }

      if (
        property.price < filters.priceRange[0] ||
        property.price > filters.priceRange[1]
      ) {
        return false;
      }

      if (filters.bedrooms > 0 && property.bedrooms < filters.bedrooms) {
        return false;
      }

      if (filters.bathrooms > 0 && property.bathrooms < filters.bathrooms) {
        return false;
      }

      if (
        filters.amenities.length > 0 &&
        !filters.amenities.every((amenity) =>
          property.amenities.includes(amenity)
        )
      ) {
        return false;
      }

      return true;
    }).length;

    setFilteredCount(count);
  }, [filters]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleClear = () => {
    setFilters({
      propertyTypes: [],
      priceRange: [0, 10000],
      bedrooms: 0,
      bathrooms: 0,
      amenities: [],
      placeType: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl dark:bg-gray-900">
        {/* Header */}
        <div className="border-b px-6 py-4 dark:border-gray-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-center text-lg font-semibold dark:text-white">
            Filters
          </h2>
        </div>

        {/* Content */}
        <div className="h-[calc(90vh-140px)] overflow-y-auto px-6 py-4">
          {/* Type of Place */}
          <FilterSection title="Type of Place">
            <div className="flex flex-wrap gap-2">
              {PLACE_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      placeType: prev.placeType.includes(type)
                        ? prev.placeType.filter((t) => t !== type)
                        : [...prev.placeType, type],
                    }));
                  }}
                  className={`rounded-full border px-4 py-2 transition-colors ${
                    filters.placeType.includes(type)
                      ? "border-blue-500 bg-blue-50 text-blue-500 dark:border-blue-400 dark:bg-blue-900/50 dark:text-blue-400"
                      : "border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range">
            <PriceRangeSlider
              value={filters.priceRange}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, priceRange: value }))
              }
            />
          </FilterSection>

          {/* Property Type */}
          <FilterSection title="Property Type">
            <PropertyTypeSelector
              types={PROPERTY_TYPES}
              selected={filters.propertyTypes}
              onChange={(types) =>
                setFilters((prev) => ({ ...prev, propertyTypes: types }))
              }
            />
          </FilterSection>

          {/* Rooms & Beds */}
          <FilterSection title="Rooms & Bathrooms">
            <div className="space-y-6">
              <RoomCounter
                label="Bedrooms"
                value={filters.bedrooms}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, bedrooms: value }))
                }
              />
              <RoomCounter
                label="Bathrooms"
                value={filters.bathrooms}
                onChange={(value) =>
                  setFilters((prev) => ({ ...prev, bathrooms: value }))
                }
              />
            </div>
          </FilterSection>

          {/* Amenities */}
          <FilterSection title="Amenities">
            <div className="grid grid-cols-2 gap-4">
              {displayedAmenities.map((amenity) => (
                <label key={amenity} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => {
                      setFilters((prev) => ({
                        ...prev,
                        amenities: e.target.checked
                          ? [...prev.amenities, amenity]
                          : prev.amenities.filter((a) => a !== amenity),
                      }));
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-900"
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    {amenity}
                  </span>
                </label>
              ))}
            </div>
            {AMENITIES.length > 6 && (
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showAllAmenities ? "Show less" : "Show more"}
              </button>
            )}
          </FilterSection>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <button
            onClick={handleClear}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Clear all
          </button>
          <Button onClick={() => onApply(filters)}>
            Show {filteredCount}{" "}
            {filteredCount === 1 ? "property" : "properties"}
          </Button>
        </div>
      </div>
    </div>
  );
}
