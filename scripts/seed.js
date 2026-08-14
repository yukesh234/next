const mongoose = require('mongoose');

// Read the connection URI from the environment variable loaded via --env-file
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not defined.');
  process.exit(1);
}

// Define inline schemas to avoid ESM / module resolution or alias issues
const CategorySchema = new mongoose.Schema(
  {
    catname: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const ArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Article = mongoose.models.Article || mongoose.model('Article', ArticleSchema);

const categoriesData = [
  { catname: 'Technology' },
  { catname: 'Lifestyle' },
  { catname: 'Travel' },
  { catname: 'Food' },
  { catname: 'Health' },
];

const getArticlesData = (categoryMap) => [
  {
    title: 'The Future of Web Development with Next.js 16',
    description: 'Explore how Next.js 16 is revolutionizing developer experience with improved build speeds, new compiler integrations, and next-generation routing mechanisms. Learn how you can leverage these updates in your production apps today.',
    categoryId: categoryMap['Technology'],
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop',
  },
  {
    title: 'A Deep Dive into Mongoose and MongoDB Atlas',
    description: 'Learn how to connect Mongoose to MongoDB Atlas, create schemas, write robust validation logic, and run migrations or seed scripts easily in modern Node.js applications.',
    categoryId: categoryMap['Technology'],
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop',
  },
  {
    title: '10 Hidden Gems to Visit in Europe This Summer',
    description: 'From the quiet fishing villages of Portugal to the dramatic fjords of Norway, discover ten off-the-beaten-path destinations in Europe that will blow you away without the typical tourist crowds.',
    categoryId: categoryMap['Travel'],
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop',
  },
  {
    title: 'The Ultimate Guide to Solo Backpacking',
    description: 'Backpacking solo can be one of the most rewarding experiences of your life. This guide covers budget planning, packing essentials, safety precautions, and how to meet fellow travelers along the way.',
    categoryId: categoryMap['Travel'],
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=800&auto=format&fit=crop',
  },
  {
    title: 'Mastering the Art of Homemade Sourdough Bread',
    description: 'Sourdough baking is both a science and an art. Follow our step-by-step guide to cultivating your starter, mastering the stretch-and-fold technique, and baking the perfect crusty loaf at home.',
    categoryId: categoryMap['Food'],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop',
  },
  {
    title: 'Creating a Minimalist Workspace for Focus and Productivity',
    description: 'Cluttered desk, cluttered mind. Learn the principles of minimalist design to organize your office, reduce digital distractions, and design a space that naturally promotes deep work and creativity.',
    categoryId: categoryMap['Lifestyle'],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop',
  },
  {
    title: '5 Daily Mindfulness Practices for Mental Well-being',
    description: 'Incorporating mindfulness into your daily routine doesn\'t require hours of meditation. Discover five quick, simple habits that help reduce stress, build resilience, and keep you grounded throughout a busy workday.',
    categoryId: categoryMap['Health'],
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing articles and categories...');
    await Article.deleteMany({});
    await Category.deleteMany({});
    console.log('Database cleared.');

    // Seed categories
    console.log('Inserting categories...');
    const insertedCategories = await Category.insertMany(categoriesData);
    console.log(`Inserted ${insertedCategories.length} categories.`);

    // Map category name to ID
    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.catname] = cat._id;
    });

    // Seed articles
    console.log('Inserting articles...');
    const articlesDataList = getArticlesData(categoryMap);
    const insertedArticles = await Article.insertMany(articlesDataList);
    console.log(`Inserted ${insertedArticles.length} articles.`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
}

seed();
