import Link from 'next/link';
import Image from 'next/image'

export default async function Home() {
  const wordpressUrl = process.env.WORDPRESS_URL;
  const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts?_embed`);
  const posts: any = await response.json();

  return (
    <main className="w-full max-w-4xl m-auto">
      {posts.map((post : any) => (
          <PostCard
            key={post.slug}
            title={post.title.rendered}
            excerpt={post.excerpt.rendered}
            imageUrl={post._embedded ? post._embedded['wp:featuredmedia'] ? post._embedded['wp:featuredmedia'][0].source_url : '' : ''}
            slug={post.slug}
          />
      ))}
    </main>
  )
}

const PostCard = ({ title, excerpt, imageUrl, slug }: {
  title: string;
  excerpt: string;
  imageUrl: string;
  slug: string;
}) => {

  const wordpressUrl = process.env.WORDPRESS_URL;

  return (
    <Link href={`/post/${slug}`} key={slug}>
      <div className='m-4'>
        <div className="bg-white shadow-lg rounded-lg overflow-hidden w-full">
          {imageUrl && (
            <Image src={wordpressUrl + imageUrl} width={400} height={400} alt={title} className="w-full h-40 object-cover" />
          )}
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <div dangerouslySetInnerHTML={{ __html: excerpt }} />
          </div>
        </div>
      </div>
    </Link>
  );
};
