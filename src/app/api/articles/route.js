import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Category from '@/models/Category'; // Ensure the Category model is registered for populate
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');

    let filter = {};

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const articles = await Article.find(filter)
      .populate('categoryId', 'catname')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
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

    const article = await Article.create({
      title,
      description,
      categoryId,
      image,
    });

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
