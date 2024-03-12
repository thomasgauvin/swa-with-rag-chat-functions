import { Page } from "../../lib/types";

const wordpressUrl = process.env.WORDPRESS_URL;

export async function generateStaticParams() {
  const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages?_fields[]=slug`);
  const pages : Page[] = await response.json();
  const paths = pages.map(page => ({
    slug: page.slug 
  }));
  return paths;
}

export default async function Page({ params }: { params: { slug: string } }) {  
    // Fetch the blog post data based on the slug (you may use an API or other method)
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/pages/?slug=${params.slug}`);
    const page : Page = (await response.json())[0];

    return (
      <div className="my-8 max-w-3xl m-auto">
        <h1 className="text-3xl font-semibold my-4">{page.title.rendered}</h1>
        <div className="prose" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />

      </div>
    );
};



