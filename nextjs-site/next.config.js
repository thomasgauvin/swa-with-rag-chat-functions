/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'demo-headless-wordpress-for-swa.azurewebsites.net',
                port: '',
            },
            {
                protocol: 'https',
                hostname: 'secure.gravatar.com',
                port: '',
            }
        ]
    }
}

module.exports = nextConfig
