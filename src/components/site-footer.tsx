export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-n-200 bg-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-6 text-center text-xs text-n-600">
        © {year} Fitt.d
      </div>
    </footer>
  );
}
