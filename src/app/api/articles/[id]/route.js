import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category'; // Ensure the Category model is registered for populate
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const article = await Article.findById(id).populate('categoryId', 'catname');
    
    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const { title, description, categoryId, image } = body;

    if (!title || !description || !categoryId || !image) {
      return NextResponse.json(
        { success: false, error: 'All fields (title, description, categoryId, image) are required.' },
        { status: 400 }
      );
    }

    // Verify the category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return NextResponse.json({ success: false, error: 'Invalid category selected.' }, { status: 400 });
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { title, description, categoryId, image },
      { new: true, runValidators: true }
    ).populate('categoryId', 'catname');

    if (!updatedArticle) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedArticle });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    const deletedArticle = await Article.findByIdAndDelete(id);

    if (!deletedArticle) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
