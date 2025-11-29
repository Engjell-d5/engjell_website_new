# Engjell Rraklli Website

A Next.js multi-page website for Engjell Rraklli, tech entrepreneur.

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Admin Panel

The website includes a full admin panel for managing users and blog posts.

### Initial Setup

1. Create your first admin user by running:
```bash
npx tsx scripts/init-admin.ts
```

This will create a default admin user:
- Email: `admin@engjellrraklli.com`
- Password: `admin123` (or set `ADMIN_PASSWORD` environment variable)

**⚠️ Important:** Change the default password after first login!

### Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Log in with your admin credentials
3. You'll be redirected to the admin dashboard

### Admin Features

- **User Management** (Admin only)
  - Create, edit, and delete users
  - Assign roles (Admin or Editor)
  - Manage user permissions

- **Blog Management**
  - Create, edit, and delete blog posts
  - Publish/unpublish posts
  - Manage categories and content
  - **Advanced WYSIWYG Editor** with:
    - Rich text formatting (bold, italic, underline, headings, lists, quotes)
    - Image upload and management
    - Image property editing (size, alignment)
    - Link insertion
    - Text alignment
    - Full HTML content support

### YouTube Integration

The website automatically fetches videos from your YouTube channel using a cron job:
- Videos are fetched daily (configurable schedule)
- Data is stored locally in `/data/videos.json`
- No API calls are made when displaying videos on the site
- Admin panel at `/admin/youtube` allows:
  - Manual video fetching
  - Configuring cron schedule
  - Viewing last fetch time

**Initial Setup:**
1. The YouTube API key is already configured
2. On first server start, the cron job will initialize
3. You can manually fetch videos from the admin panel
4. Default schedule: Daily at 2 AM (`0 2 * * *`)

### Data Storage

Data is stored in JSON files in the `/data` directory:
- `users.json` - User accounts
- `blogs.json` - Blog posts
- `videos.json` - YouTube videos (fetched via cron)
- `config.json` - YouTube and cron configuration

**Note:** For production, consider migrating to a proper database (PostgreSQL, MongoDB, etc.)

## Project Structure

- `app/` - Next.js App Router pages
  - `page.tsx` - Home page
  - `about/page.tsx` - About page
  - `media/page.tsx` - Media library page
  - `journal/page.tsx` - Journal/blog page (fetches from API)
  - `ventures/page.tsx` - Ventures portfolio page
  - `contact/page.tsx` - Contact page
  - `admin/` - Admin panel pages
- `components/` - Shared React components
  - `Header.tsx` - Navigation header
  - `Footer.tsx` - Site footer
  - `Sidebar.tsx` - Dynamic sidebar component
- `lib/` - Utility functions
  - `data.ts` - Data storage functions
  - `auth.ts` - Authentication utilities
- `app/api/` - API routes
  - `auth/` - Authentication endpoints
  - `users/` - User management endpoints
  - `blogs/` - Blog management endpoints
- `app/globals.css` - Global styles and CSS variables

## Environment Variables

Create a `.env.local` file for production:

```
JWT_SECRET=your-secret-key-here
ADMIN_PASSWORD=your-secure-password
```

## Notes

- Make sure to add the logo image `Engjell_Rraklli_White_Logo_Mark.svg` to the `public/` directory
- The design and content remain exactly the same as the original HTML version
- Navigation uses Next.js Link components for client-side routing
- Images are optimized using Next.js Image component
- Blog posts are now managed through the admin panel and displayed dynamically
- Uploaded images are stored in `/public/uploads/` (gitignored)
- The WYSIWYG editor supports full HTML content - click on images to edit their properties
