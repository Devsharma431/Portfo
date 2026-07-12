# Dev Sharma Portfolio - Deployment Configuration
# Deploy to Vercel, Netlify, or GitHub Pages

# For Vercel (vercel.json)
{
  "buildCommand": "echo 'static site - no build step'",
  "outputDirectory": ".",
  "devCommand": "npx serve .",
  "framework": null,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/js/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}

# For Netlify (netlify.toml)
# [build]
#   command = "echo 'static site'"
#   publish = "."
#
# [[headers]]
#   for = "/*"
#   [headers.values]
#     X-Content-Type-Options = "nosniff"
#     X-Frame-Options = "DENY"
#     X-XSS-Protection = "1; mode=block"
#     Referrer-Policy = "strict-origin-when-cross-origin"
#
# [[headers]]
#   for = "/assets/*"
#   [headers.values]
#     Cache-Control = "public, max-age=31536000, immutable"
#
# [[headers]]
#   for = "/js/*"
#   [headers.values]
#     Cache-Control = "public, max-age=31536000, immutable"
#
# [[headers]]
#   for = "/css/*"
#   [headers.values]
#     Cache-Control = "public, max-age=31536000, immutable"

# For GitHub Pages - just push to gh-pages branch or use GitHub Actions