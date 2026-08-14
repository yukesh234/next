import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please select a category'],
    },
    image: {
      type: String,
      required: [true, 'Please provide an image'],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);
