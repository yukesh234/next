import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category'; // Ensure the Category model is registered for populate
import Link from 'next/link';
import { Calendar, ArrowLeft, BookOpen, Clock, Tag } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function ArticlePage({ params }) {
  const { id } = await params;

  await dbConnect();

  let article;
  let relatedArticles = [];

  try {
    article = await Article.findById(id).populate('categoryId', 'catname');
    if (!article) {
      notFound();
    }

    // Fetch up to 3 related articles (excluding the current one)
    relatedArticles = await Article.find({
      categoryId: article.categoryId?._id || article.categoryId,
      _id: { $ne: id }
    })
    .limit(3)
    .populate('categoryId', 'catname');
  } catch (error) {
    console.error('Error loading article:', error);
    notFound();
  }

  // Format the description into paragraphs by splitting on newlines
  const paragraphs = article.description
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Estimate read time (avg 200 words per min)
  const wordCount = article.description.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:text-indigo-600 shadow-xs hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Stories
          </Link>
        </div>

        {/* Article Reader Wrapper */}
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          
          {/* Header Metadata */}
          <div className="p-6 sm:p-8 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                {article.categoryId?.catname || 'Uncategorized'}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(article.createdAt).toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {readTime} min read
              </div>
            </div>
            
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {article.title}
            </h1>
          </div>

          {/* Banner Cover Image */}
          <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Article Main Text Content */}
          <div className="prose prose-indigo max-w-none p-6 sm:p-8 text-slate-600 sm:text-lg leading-relaxed space-y-6">
            {paragraphs.map((para, index) => (
              <p key={index} className="whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>

        </article>

        {/* Related Articles Section */}
        <section className="mt-12 border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Related Stories</h2>
            <span className="text-sm font-semibold text-slate-500">
              More from {article.categoryId?.catname || 'this category'}
            </span>
          </div>

          {relatedArticles.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white py-10 text-center shadow-xs">
              <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">No other articles in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related._id}
                  href={`/articles/${related._id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all duration-200"
                >
                  <div className="h-32 overflow-hidden bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={related.image}
                      alt={related.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-sm">
                      {related.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(related.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
