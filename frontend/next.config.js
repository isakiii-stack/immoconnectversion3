/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'supabase.co',
      'your-supabase-project.supabase.co',
      's3.amazonaws.com',
      'your-bucket.s3.amazonaws.com'
    ],
  },
}

module.exports = nextConfig
