import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-6">
      <div className="mx-auto max-w-screen-xl flex flex-col items-center gap-2 px-4 md:px-6">
        <p className="text-sm text-muted-foreground text-center">
          © {year} <Link href="/" className="font-semibold hover:underline">MoodSync</Link>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}