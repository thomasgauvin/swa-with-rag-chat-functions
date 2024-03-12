export type Post = {
    id: number;
    date: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    slug: string;
    _embedded: {
        author: {
            id: string;
            name: string;
            description: string;
            avatar_urls: { [key: string]: string };
        }[];
        'wp:featuredmedia': {
            id: number;
            slug: string;
            source_url: string;
            title: { rendered: string };
        }[];
    };
};

export type Page = {
    id: number;
    date: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    slug: string;
}

export type PageWithSlugAndTitle = {
    slug: string;
    title: {
        rendered: string;
    };
}

export type BlogInfo = {
    name: string;
    description: string;
};