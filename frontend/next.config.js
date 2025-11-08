/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pour Capacitor, décommentez la ligne suivante :
  // output: 'export',
  
  images: {
    // Pour Capacitor, décommentez la ligne suivante :
    // unoptimized: true,
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
