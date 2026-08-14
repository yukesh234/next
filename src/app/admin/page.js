'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  Tag, 
  BookOpen, 
  FolderPlus,
  Loader2, 
  X, 
  Check, 
  AlertCircle,
  FileText,
  UploadCloud,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('articles');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Categories State
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [updatingCategory, setUpdatingCategory] = useState(false);

  // Articles State
  const [articles, setArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [submittingArticle, setSubmittingArticle] = useState(false);

  // Article Form State
  const [articleForm, setArticleForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    image: '',
    imageType: 'url' // 'url' or 'upload'
  });

  // Utility to show notification toast
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  // Fetch Categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        showToast(data.error || 'Failed to fetch categories', 'error');
      }
    } catch (err) {
      showToast('Network error while fetching categories', 'error');
    } finally {
      setLoadingCategories(false);
    }
  }, [showToast]);

  // Fetch Articles
  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      if (data.success) {
        setArticles(data.data);
      } else {
        showToast(data.error || 'Failed to fetch articles', 'error');
      }
    } catch (err) {
      showToast('Network error while fetching articles', 'error');
    } finally {
      setLoadingArticles(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
    fetchArticles();
  }, [fetchCategories, fetchArticles]);

  // Create Category
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSubmittingCategory(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catname: categoryName }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category created successfully!');
        setCategoryName('');
        setLoadingCategories(true);
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to create category', 'error');
      }
    } catch (err) {
      showToast('Network error creating category', 'error');
    } finally {
      setSubmittingCategory(false);
    }
  };

  // Update Category
  const handleCategoryUpdate = async (e, id) => {
    e.preventDefault();
    if (!editingCategoryName.trim()) return;
    setUpdatingCategory(true);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catname: editingCategoryName }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Category renamed successfully!');
        setEditingCategoryId(null);
        setEditingCategoryName('');
        setLoadingCategories(true);
        fetchCategories();
        // Refetch articles in case category name updates are loaded
        setLoadingArticles(true);
        fetchArticles();
      } else {
        showToast(data.error || 'Failed to update category', 'error');
      }
    } catch (err) {
      showToast('Network error updating category', 'error');
    } finally {
      setUpdatingCategory(false);
    }
  };

  // Delete Category
  const handleCategoryDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Category deleted successfully!');
        setLoadingCategories(true);
        fetchCategories();
      } else {
        showToast(data.error || 'Failed to delete category', 'error');
      }
    } catch (err) {
      showToast('Network error deleting category', 'error');
    }
  };

  // Open Article Modal for Creation
  const openCreateArticleModal = () => {
    setEditingArticle(null);
    setArticleForm({
      title: '',
      description: '',
      categoryId: categories[0]?._id || '',
      image: '',
      imageType: 'url'
    });
    setIsArticleModalOpen(true);
  };

  // Open Article Modal for Editing
  const openEditArticleModal = (article) => {
    setEditingArticle(article);
    setArticleForm({
      title: article.title,
      description: article.description,
      categoryId: article.categoryId?._id || article.categoryId || '',
      image: article.image,
      imageType: article.image.startsWith('data:') ? 'upload' : 'url'
    });
    setIsArticleModalOpen(true);
  };

  // Handle local image file upload and conversion to base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB restriction
      showToast('Image file size must be less than 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setArticleForm(prev => ({ ...prev, image: reader.result }));
      showToast('Image file uploaded and parsed successfully');
    };
    reader.onerror = () => {
      showToast('Failed to parse file', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Submit Article Form (Create or Update)
  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    const { title, description, categoryId, image } = articleForm;

    if (!title.trim() || !description.trim() || !categoryId || !image.trim()) {
      showToast('Please fill out all fields and supply an image', 'error');
      return;
    }

    setSubmittingArticle(true);
    const endpoint = editingArticle ? `/api/articles/${editingArticle._id}` : '/api/articles';
    const method = editingArticle ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, categoryId, image }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(editingArticle ? 'Article updated successfully!' : 'Article published successfully!');
        setIsArticleModalOpen(false);
        setLoadingArticles(true);
        fetchArticles();
      } else {
        showToast(data.error || 'Failed to submit article', 'error');
      }
    } catch (err) {
      showToast('Network error submitting article', 'error');
    } finally {
      setSubmittingArticle(false);
    }
  };

  // Delete Article
  const handleArticleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Article deleted successfully!');
        setLoadingArticles(true);
        fetchArticles();
      } else {
        showToast(data.error || 'Failed to delete article', 'error');
      }
    } catch (err) {
      showToast('Network error deleting article', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`fixed right-4 top-20 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-lg transition-all duration-300 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/10' : 'bg-rose-50 text-rose-800 ring-1 ring-rose-600/10'
        }`}>
          {toast.type === 'success' ? <Check className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4 text-rose-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create, update, and manage your categories and blog articles.
          </p>
        </div>
        <div className="mt-4 sm:ml-4 sm:mt-0">
          <button
            onClick={openCreateArticleModal}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
          >
            <Plus className="h-4 w-4" />
            Write Article
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all w-full text-left ${
                activeTab === 'articles'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <BookOpen className={`h-5 w-5 ${activeTab === 'articles' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Articles
              <span className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                {articles.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold transition-all w-full text-left ${
                activeTab === 'categories'
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Tag className={`h-5 w-5 ${activeTab === 'categories' ? 'text-indigo-600' : 'text-slate-400'}`} />
              Categories
              <span className="ml-auto rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                {categories.length}
              </span>
            </button>
          </nav>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {activeTab === 'articles' ? (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900">Manage Articles</h2>
                <p className="text-sm text-slate-500">Edit, remove, or check the publication status of your posts.</p>
              </div>

              {loadingArticles ? (
                <div className="flex h-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : articles.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 py-16 text-center">
                  <FileText className="h-12 w-12 text-slate-300" />
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">No articles yet</h3>
                  <p className="mt-1 text-sm text-slate-500">Get started by creating your very first article.</p>
                  <div className="mt-6">
                    <button
                      onClick={openCreateArticleModal}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      <Plus className="h-4 w-4" />
                      Write Article
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Cover</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Title</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Published</th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {articles.map((article) => (
                        <tr key={article._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="whitespace-nowrap px-4 py-3">
                            <div className="h-12 w-20 overflow-hidden rounded border border-slate-100 bg-slate-50 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={article.image}
                                alt={article.title}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://placehold.co/120x80/e2e8f0/64748b?text=Broken+Image';
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="max-w-xs sm:max-w-md truncate font-semibold text-slate-900">{article.title}</div>
                            <div className="max-w-xs sm:max-w-md truncate text-xs text-slate-500">{article.description}</div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3">
                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                              {article.categoryId?.catname || 'Uncategorized'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                            {new Date(article.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => openEditArticleModal(article)}
                                className="text-slate-600 hover:text-indigo-600 transition-colors"
                              >
                                <Edit3 className="h-4.5 w-4.5" />
                              </button>
                              <button
                                onClick={() => handleArticleDelete(article._id)}
                                className="text-slate-400 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Manage Categories</h2>
                <p className="text-sm text-slate-500">Organize articles by creating and managing category terms.</p>
              </div>

              {/* Create Category Form */}
              <form onSubmit={handleCategorySubmit} className="mb-8 flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    placeholder="Enter category name (e.g. Travel, Tech, Life)"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingCategory || !categoryName.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:bg-slate-200 transition-all"
                >
                  {submittingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />}
                  Add Category
                </button>
              </form>

              {/* Categories list */}
              {loadingCategories ? (
                <div className="flex h-24 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                </div>
              ) : categories.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
                  <Tag className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">No categories found. Add one above!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border-t border-slate-200">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                      {editingCategoryId === category._id ? (
                        <form onSubmit={(e) => handleCategoryUpdate(e, category._id)} className="flex flex-1 items-center gap-2">
                          <input
                            type="text"
                            required
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={updatingCategory || !editingCategoryName.trim()}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:text-slate-300 transition-all"
                          >
                            {updatingCategory ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Check className="h-4.5 w-4.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategoryId(null)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-all"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                            <span className="font-semibold text-slate-800">{category.catname}</span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCategoryId(category._id);
                                setEditingCategoryName(category.catname);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                            >
                              <Edit3 className="h-4.5 w-4.5" />
                            </button>
                            <button
                              onClick={() => handleCategoryDelete(category._id)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Create / Edit Article Modal */}
      {isArticleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-2xl transition-all">
            {/* Modal Close */}
            <button
              onClick={() => setIsArticleModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Title */}
            <h3 className="text-xl font-bold leading-6 text-slate-900 mb-6">
              {editingArticle ? 'Edit Article' : 'Write New Article'}
            </h3>

            {categories.length === 0 ? (
              <div className="py-6 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-rose-500" />
                <p className="mt-2 text-sm font-semibold text-slate-800">You must create a category first!</p>
                <button
                  onClick={() => {
                    setIsArticleModalOpen(false);
                    setActiveTab('categories');
                  }}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                >
                  Create Category
                </button>
              </div>
            ) : (
              <form onSubmit={handleArticleSubmit} className="space-y-5">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1">
                    Article Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    placeholder="E.g. 10 Essential Web Dev Tips"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Category Selector */}
                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    required
                    value={articleForm.categoryId}
                    onChange={(e) => setArticleForm({ ...articleForm, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.catname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Input Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Cover Image
                  </label>
                  
                  {/* Select URL vs Local Upload */}
                  <div className="mb-3 flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      onClick={() => setArticleForm({ ...articleForm, imageType: 'url' })}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-semibold transition-all ${
                        articleForm.imageType === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleForm({ ...articleForm, imageType: 'upload' })}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-md py-1.5 text-xs font-semibold transition-all ${
                        articleForm.imageType === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      Upload File
                    </button>
                  </div>

                  {articleForm.imageType === 'url' ? (
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={articleForm.image.startsWith('data:') ? '' : articleForm.image}
                      onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  ) : (
                    <div className="flex items-center gap-4">
                      <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-5 hover:bg-slate-100/70 transition-colors">
                        <UploadCloud className="h-6 w-6 text-slate-400" />
                        <span className="mt-2 text-xs font-semibold text-slate-600">Select local image file</span>
                        <span className="text-[10px] text-slate-400">Max size 2MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      
                      {articleForm.image && articleForm.image.startsWith('data:') && (
                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-100 relative shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={articleForm.image}
                            alt="Preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Description / Content */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1">
                    Article Description & Content
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={6}
                    placeholder="Write the body of your article here. You can use markdown format if desired..."
                    value={articleForm.description}
                    onChange={(e) => setArticleForm({ ...articleForm, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
                  />
                </div>

                {/* Submit Actions */}
                <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsArticleModalOpen(false)}
                    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingArticle}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-300 transition-all"
                  >
                    {submittingArticle ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      editingArticle ? 'Save Changes' : 'Publish Article'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
