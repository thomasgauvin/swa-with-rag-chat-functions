# Building an Azure Static Web Apps site using WordPress on App Service as a headless CMS

This is a sample project that demonstrates how to build a static web app using WordPress as a headless CMS and deployed to Azure Static Web Apps. This project uses Next.js to build the static web app pulling content from the WordPress REST APIs. This repository complements the blog on this topic: [Build an Azure Static Web Apps site using WordPress as a headless CMS](https://techcommunity.microsoft.com/t5/apps-on-azure-blog/building-an-azure-static-web-apps-site-using-wordpress-on-app/ba-p/4004955). 

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Understand how this project uses WordPress as a headless CMS

Let's take for instance the BlogPage component located at `app\post\[slug]\page.tsx`. This component is responsible for fetching the content from WordPress and rendering it. The `getStaticProps` function is responsible for fetching the content from WordPress. Let's take a look at the code:

```tsx
const wordpressUrl = process.env.WORDPRESS_URL;

export async function generateStaticParams(){
  const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts?_fields[]=slug`);
  const posts : Post[] = await response.json();
  const paths = posts.map(post => ({
    slug: post.slug 
  }));
  return paths;
}
```

In the above code snippet, we are accessing the WORDPRESS_URL that is accessible as an environment variable and defined in the .env file. This will be used as a build-time environment variable to fetch the content from WordPress.

We then make a fetch request to the WordPress REST API to fetch the content of the post. The `slug` is passed as a parameter to the function and is used to fetch the content of the post. 

The same is done for WordPress pages. Once we have this content, we can decide to render it how we want. More information on the available WordPress REST API endpoints can be found [here](https://developer.wordpress.org/rest-api/reference/).
