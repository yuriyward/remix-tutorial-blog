import { Link } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <p className="flex flex-col">
      <Link to="new" className="text-blue-600 underline">
        Create a New Post
      </Link>
    </p>
  );
}
