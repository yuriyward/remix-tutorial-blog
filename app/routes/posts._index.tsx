import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getPosts } from "~/models/post.server";

export const loader = async () => {
  // return json({ posts: await getPostsListings() });
  let posts = await getPosts();

  return json({
    posts: posts.map((post) => ({ slug: post.slug, title: post.title })),
  });
};

export default function Posts() {
  const { posts } = useLoaderData<typeof loader>();
  console.log("Posts", posts);

  return (
    <main>
      <Link to="admin" className="text-red-600 underline">
        Admin
      </Link>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to={`/posts/${post.slug}`}
              className="text-blue-600 underline"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
