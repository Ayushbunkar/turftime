"use client"

import { useState, useCallback, useEffect } from "react"
import { defaultFilters } from "../constants/appConstants"
import { hasAvailableSlots } from "../utils/turfUtils"

export const useFilters = (turfs) => {
  const [filters, setFilters] = useState(defaultFilters)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTurfs, setFilteredTurfs] = useState(turfs)

  // Filter and search logic
  const applyFilters = useCallback(() => {
    const filtered = turfs.filter((turf) => {
      // Ensure turf exists and has required properties
      if (!turf || typeof turf !== "object") return false

      // Distance filter
      if (turf.distance && turf.distance > filters.distance[0]) return false

      // Price filter
      if (turf.price && (turf.price < filters.priceRange[0] || turf.price > filters.priceRange[1])) return false

      // Rating filter
      if (turf.rating && turf.rating < filters.rating[0]) return false

      // Surface filter
      if (filters.surface !== "all" && turf.surface && turf.surface.toLowerCase() !== filters.surface.toLowerCase())
        return false

      // Weather dependent filter
      if (filters.weatherDependent !== "all") {
        const isWeatherDependent = filters.weatherDependent === "true"
        if (turf.weatherDependent !== isWeatherDependent) return false
      }

      // Amenities filter
      if (filters.amenities.length > 0 && Array.isArray(turf.amenities)) {
        const hasAllAmenities = filters.amenities.every((amenity) =>
          turf.amenities.some(
            (turfAmenity) => turfAmenity && turfAmenity.toLowerCase().includes(amenity.toLowerCase()),
          ),
        )
        if (!hasAllAmenities) return false
      }

      // Availability filter
      if (filters.availability === "available") {
        if (!hasAvailableSlots(turf.timeSlots)) return false
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableFields = [
          turf.name,
          turf.address,
          turf.description,
          ...(Array.isArray(turf.amenities) ? turf.amenities : []),
        ].filter(Boolean)

        const matchesSearch = searchableFields.some((field) => field && field.toLowerCase().includes(query))

        if (!matchesSearch) return false
      }

      return true
    })

    // Sort results
    switch (filters.sortBy) {
      case "distance":
        filtered.sort((a, b) => (a.distance || 0) - (b.distance || 0))
        break
      case "price":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "popularity":
        filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
        break
      case "newest":
        filtered.sort((a, b) => {
          const dateA = new Date(a.established || "1900")
          const dateB = new Date(b.established || "1900")
          return dateB - dateA
        })
        break
      default:
        break
    }

    setFilteredTurfs(filtered)
  }, [turfs, filters, searchQuery])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const resetFilters = () => {
    setFilters(defaultFilters)
    setSearchQuery("")
  }

  return {
    filters,
    setFilters,
    searchQuery,
    setSearchQuery,
    filteredTurfs,
    resetFilters,
  }
}
