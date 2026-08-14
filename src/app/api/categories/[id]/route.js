import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Article from '@/models/Article';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    if (!body.catname || body.catname.trim() === '') {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { catname: body.catname.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedCategory });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;

    // Check if there are any articles referencing this category
    const articlesCount = await Article.countDocuments({ categoryId: id });
    if (articlesCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category because it has articles associated with it.' },
        { status: 400 }
      );
    }

    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
