import { Post } from '../lib/types';
import Image from 'next/image';


const wordpressUrl = process.env.WORDPRESS_URL;

export const BlogPost = ({ post } : { post: Post }) => {

    const imageUrl = post && post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]?.source_url;
    const imageAlt = post && post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]?.title.rendered;
  
      return (
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto my-8">
            <h1 className="text-3xl font-semibold my-4" dangerouslySetInnerHTML={{__html: post.title.rendered}}/>
            <div dangerouslySetInnerHTML={{__html: post.excerpt.rendered}}></div>
            <div className="flex mt-4">
              <Image
                width={50}
                height={50}
                src={`${post._embedded && post._embedded.author[0]?.avatar_urls['48']}`}
                alt={post._embedded && post._embedded.author[0].name}
                className="rounded-full"
              />
              <div className="pl-4">
                <div className="text-gray-800 font-bold">{post._embedded.author[0].name}</div>
                <div className="text-gray-600 text-sm">{new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>
  
          {imageUrl && imageAlt && (
            <div className='max-w-5xl mx-auto my-8'>
              <Image
                width={400}
                height={400}
                src={`${wordpressUrl}${post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]?.source_url}`}
                alt={post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]?.title.rendered}
                className="w-full object-cover"
              />
            </div>)
          }
          <div className="text-gray-600 max-w-3xl mx-auto m-4">
            <div className="prose" dangerouslySetInnerHTML={{__html: post.content.rendered}}/>
          </div>
        </div>
      );
  };