import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useNavigation } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getPost, updatePost } from "~/models/post.server";

export const loader = async ({ params }: LoaderArgs) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json({ post });
};

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");

  const errors = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown is required",
  };
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json(errors);
  }

  invariant(typeof title === "string", "title must be a string");
  invariant(typeof slug === "string", "slug must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");

  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);
  await updatePost({ title, slug, markdown }, post.slug);

  return redirect("/posts/admin");
};

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

export default function PostAdminSlug() {
  const { post } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const isCreating = Boolean(navigation.state === "submitting");
  return (
    <Form method="post">
      <p>
        <label>
          Post Title:{" "}
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
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={post.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown: </label>
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
          defaultValue={post.markdown}
        />
      </p>
      <p className="text-right">
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
          disabled={isCreating}
        >
          {isCreating ? "Updating..." : "Update Post"}
        </button>
      </p>
    </Form>
  );
}
