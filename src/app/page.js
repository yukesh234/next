'use client';

import React, { useState, useEffect } from 'react';
import { Search, Calendar, BookOpen, ArrowRight, Loader2, Filter } from 'lucide-react';
import Link from 'next/link';

export default function BlogHome() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch all articles and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          fetch('/api/articles'),
          fetch('/api/categories')
        ]);
        
        const articlesData = await articlesRes.json();
        const categoriesData = await categoriesRes.json();

        if (articlesData.success) setArticles(articlesData.data);
        if (categoriesData.success) setCategories(categoriesData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter articles based on search and category choice
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || 
      (article.categoryId?._id === selectedCategory) || 
      (article.categoryId === selectedCategory);
      
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-white py-16 sm:py-24 border-b border-slate-100">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-50/50 via-white to-violet-50/50" />
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-violet-100/50 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
            Welcome to Narrative
          </span>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Where ideas, code, and <br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              stories connect.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
            Explore articles and tutorials about web development, design systems, lifestyle, and software architecture.
          </p>
        </div>
      </section>

      {/* Main Content: Search & Filters & Article Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Filters and Search Bar Container */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-8">
          
          {/* Category Filter Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Stories
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
                  selectedCategory === category._id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {category.catname}
              </button>
            ))}
          </div>

          {/* Search Bar Input */}
          <div className="relative w-full max-w-xs shrink-0">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm font-medium text-slate-900 shadow-xs outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Loading Spinner or Grid Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="h-48 w-full rounded-xl bg-slate-200" />
                <div className="mt-4 h-4 w-1/4 rounded bg-slate-200" />
                <div className="mt-3 h-6 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full rounded bg-slate-200" />
                <div className="mt-1 h-4 w-full rounded bg-slate-200" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="h-4 w-1/3 rounded bg-slate-200" />
                  <div className="h-4 w-1/4 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-24 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-bold text-slate-900">No articles found</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              We couldn&apos;t find any articles matching your search query or selected category.
            </p>
            <div className="mt-6">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                Clear Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <article
                key={article._id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Cover Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Image+Not+Found';
                    }}
                  />
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {article.categoryId?.catname || 'Uncategorized'}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {new Date(article.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="mt-4 flex-1">
                    <Link href={`/articles/${article._id}`}>
                      <h3 className="text-xl font-bold leading-6 text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="mt-3 text-sm text-slate-500 line-clamp-3">
                      {article.description}
                    </p>
                  </div>

                  {/* Read More Link */}
                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <Link
                      href={`/articles/${article._id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-500 group/link"
                    >
                      Read full story
                      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
