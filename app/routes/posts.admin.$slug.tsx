import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.slug, "params.slug is required");
  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  //   const html = marked(post.markdown);

  //   return json({ html, post });
  return json({ post });
};

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");
  invariant(params.slug, "slug is required");

  if (intent === "delete") {
    await deletePost(params.slug);
    return redirect("/posts/admin");
  }

  const slug = formData.get("slug");
  const title = formData.get("title");
  const markdown = formData.get("markdown");

  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }

  invariant(typeof slug === "string", "title must be a string");
  invariant(typeof title === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  if (params.slug === "new") {
    await createPost({ title, slug, markdown });
  } else {
    await updatePost(params.slug, { title, slug, markdown });
  }

  return redirect("/posts/admin");
};

const inputClassName =
  "w-full rounded border border-gray-500 px-2 py-1 text-lg";

export default function PostAdminSlug() {
  const { post } = useLoaderData<typeof loader>();
  const errors = useActionData<typeof action>();

  const navigation = useNavigation();
  const isCreating = navigation.formData?.get("intent") === "create";
  const isUpdating = navigation.formData?.get("intent") === "update";
  const isDeleting = navigation.formData?.get("intent") === "delete";
  const isNewPost = !post;

  // const [values, setValues] = useState({
  //   // title: "",
  //   // slug: "",
  //   markdown: "",
  // });

  // useEffect(() => {
  //   setValues({
  //     // title: post.title,
  //     // slug: post.slug,
  //     markdown: post.markdown,
  //   });
  // }, [post]);

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   setValues({
  //     ...values,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  return (
    <>
      <Form method="post" key={post?.slug ?? "new-post"}>
        <p>
          <label>
            Post Title:{" "}
            {errors?.title ? (
              <em className="text-red-600">{errors.title}</em>
            ) : null}
            <input
              type="text"
              name="title"
              className={inputClassName}
              defaultValue={post.title}
            />
          </label>
        </p>
        <p>
          <label>
            Post Slug:{" "}
            {errors?.slug ? (
              <em className="text-red-600">{errors.slug}</em>
            ) : null}
            <input
              type="text"
              name="slug"
              className={inputClassName}
              defaultValue={post.slug}
            />
          </label>
        </p>
        <p>
          <label htmlFor="markdown">
            Markdown:{" "}
            {errors?.markdown ? (
              <em className="text-red-600">{errors.markdown}</em>
            ) : null}
          </label>
          <br />
          <textarea
            id="markdown"
            rows={20}
            name="markdown"
            className={`${inputClassName} font-mono`}
            defaultValue={post.markdown}
            // onChange={handleChange}
          />
          <span>{JSON.stringify(post, null, 2)}</span>
        </p>
        <div className="flex justify-end gap-4">
          {isNewPost ? null : (
            <button
              type="submit"
              name="intent"
              value="delete"
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:bg-red-400 disabled:bg-red-300"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
          <button
            type="submit"
            name="intent"
            value={isNewPost ? "create" : "update"}
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
            disabled={isCreating || isUpdating}
          >
            {isNewPost ? (isCreating ? "Creating..." : "Create Post") : null}
            {isNewPost ? null : isUpdating ? "Updating..." : "Update"}
          </button>
        </div>
      </Form>
    </>
  );
}
