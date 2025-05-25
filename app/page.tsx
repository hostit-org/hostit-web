import Hero from "@/components/layout/hero";
import MainNavbar from "@/components/layout/main-navbar";

export default async function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNavbar />
      <main className="flex-1 flex flex-col items-center justify-center p-5">
        <div className="max-w-5xl w-full">
      <Hero />
        </div>
      </main>
      <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
        <p>
          © 2025 HostIt - Open Source AI Tool Ecosystem
        </p>
      </footer>
    </div>
  );
}
