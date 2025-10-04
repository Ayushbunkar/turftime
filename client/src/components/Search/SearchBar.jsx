"use client"

import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import { Badge } from "../ui/Badge"
import { Search, Filter, X, Gift, RotateCcw } from "lucide-react"

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  filters,
  showReferral,
  setShowReferral,
  resetFilters,
  filteredTurfs,
  totalTurfs,
}) => {
  const activeFiltersCount =
    filters.amenities.length + (filters.surface !== "all" ? 1 : 0) + (filters.rating[0] > 0 ? 1 : 0)

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-2 h-10 w-10 rounded-full hover:bg-gray-100 text-green-600 z-10"
            aria-label="Search"
            tabIndex={0}
            style={{ pointerEvents: 'none' }}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Input
            placeholder="Search turfs by name, location, or amenities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-14 text-lg border border-green-200 focus:border-green-400 active:border-green-400 rounded-2xl bg-gray-50/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg focus:shadow-xl text-green-900"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-10 w-10 rounded-full hover:bg-gray-100 text-green-600"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="h-14 px-8 border border-green-200 focus:border-green-400 active:border-green-400 rounded-2xl bg-gray-50/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg group text-green-900"
        >
          <Filter className="h-5 w-5 mr-2 group-hover:rotate-180 transition-transform duration-300 text-green-600" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-green-500 animate-pulse text-white">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        <Button
          variant="outline"
          onClick={() => setShowReferral(!showReferral)}
          className="h-14 px-6 border border-green-200 focus:border-green-400 active:border-green-400 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 transition-all duration-300 hover:shadow-lg text-green-900"
        >
          <Gift className="h-5 w-5 mr-2 text-green-600" />
          Refer & Earn
        </Button>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {["Available Now", "Under ₹1000", "5★ Rated", "Natural Grass", "With Parking"].map(
          (filter, index) => (
            <Button
              key={filter}
              variant="outline"
              size="sm"
              className="rounded-full bg-gray-50/60 backdrop-blur-sm hover:bg-green-100 hover:border-green-400 focus:border-green-400 active:border-green-400 transition-all duration-300 hover:scale-105 text-green-700 border-green-200"
            >
              {filter}
            </Button>
          )
        )}
      </div>

      {/* Results count */}
      {showFilters && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="rounded-xl bg-gray-50 border-2 border-green-200 text-green-700"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
          <div className="text-sm  text-green-700">
            Showing {filteredTurfs.length} of {totalTurfs} turfs
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
