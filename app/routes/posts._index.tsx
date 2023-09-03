import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

import { getPosts } from "~/models/post.server";
import { getUser } from "~/session.server";

export const loader = async ({ request }: ActionArgs) => {
  // return json({ posts: await getPostsListings() });
  let posts = await getPosts();
  const user = await getUser(request);

  return json({
    posts: posts.map((post) => ({ slug: post.slug, title: post.title })),
    isAdmin: Boolean(user?.isAdmin),
  });
};

export default function Posts() {
  const { posts, isAdmin } = useLoaderData<typeof loader>();
  console.log("Posts", posts);
  console.log("isAdmin", isAdmin);

  return (
    <main>
      {
        isAdmin && <Link to="admin" className="text-red-600 underline">
          Admin
        </Link>
      }
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
