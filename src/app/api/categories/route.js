import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({}).sort({ catname: 1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    if (!body.catname || body.catname.trim() === '') {
      return NextResponse.json({ success: false, error: 'Category name is required' }, { status: 400 });
    }
    const category = await Category.create(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
