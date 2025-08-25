"use client";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
      <div className="text-red-600">
        Failed to load dashboard{error?.message ? `: ${error.message}` : "."}
      </div>
    </div>
  );
}
