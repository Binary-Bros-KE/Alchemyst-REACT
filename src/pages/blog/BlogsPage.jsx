"use client"

import { useState, useMemo } from "react";
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronDown } from "react-icons/fi";
import { BlogCard } from "./components/BlogCard";
import { blogs, BLOG_CATEGORIES } from "../../data/blogs";

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'popular', label: 'Most Popular' }
];

export default function BlogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter and sort blogs
  const filteredBlogs = useMemo(() => {
    let filtered = blogs;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(query) ||
        blog.excerpt.toLowerCase().includes(query) ||
        // blog.content?.toLowerCase().includes(query) ||
        blog.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(blog => blog.category === selectedCategory);
    }

    // Sort blogs
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.publishDate) - new Date(a.publishDate);
        case 'oldest':
          return new Date(a.publishDate) - new Date(b.publishDate);
        case 'popular':
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredBlogs = filteredBlogs.filter(blog => blog.featured);
  const regularBlogs = filteredBlogs.filter(blog => !blog.featured);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-900 to-blue-800 text-white py-16">
        <div className="mx-auto px-4  max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Alchemyst Blog
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Discover stories, tips, and insights about dating, relationships, and adult entertainment in Kenya
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-8  max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Hidden on mobile, shown on large screens */}
          <div className="lg:w-1/4">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
              >
                <span className="font-medium">Filters & Categories</span>
                <FiChevronDown className={`transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block space-y-6`}>
              {/* Categories */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === "all" 
                        ? "bg-primary text-white" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All Categories
                  </button>
                  {BLOG_CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-bold text-gray-900 mb-4">Sort By</h3>
                <div className="space-y-2">
                  {SORT_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        sortBy === option.value 
                          ? "bg-primary text-white" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Newsletter Signup */}
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="font-bold mb-2">Stay Updated</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Get the latest articles and dating tips delivered to your inbox.
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="w-full px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white"
                  />
                  <button className="w-full bg-white text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === "all" ? "All Articles" : selectedCategory}
                </h2>
                <p className="text-gray-600">
                  {filteredBlogs.length} article{filteredBlogs.length !== 1 ? 's' : ''} found
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex bg-white rounded-lg border p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${
                      viewMode === "grid" 
                        ? "bg-primary text-white" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${
                      viewMode === "list" 
                        ? "bg-primary text-white" 
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <FiList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Featured Blogs */}
            {featuredBlogs.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Featured Articles</h3>
                <div className="space-y-6">
                  {featuredBlogs.map(blog => (
                    <BlogCard key={blog.id} blog={blog} featured={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Blogs */}
            {regularBlogs.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {featuredBlogs.length > 0 ? "More Articles" : "All Articles"}
                </h3>
                <div className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }>
                  {regularBlogs.map(blog => (
                    <BlogCard key={blog.id} blog={blog} featured={false} />
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {filteredBlogs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FiSearch size={48} className="mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No articles found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}