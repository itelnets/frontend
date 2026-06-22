import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold text-green-900 mb-6">
          Welcome to <span className="text-green-600">Itelents</span>
        </h1>

        <p className="mt-3 text-2xl text-gray-700">
          Natural Healing for a Better Life
        </p>

        <div className="mt-10 flex space-x-6">
          <Link href="/products" className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300">
            Shop Now
          </Link>
          <Link href="/register" className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg border border-green-600 shadow-md hover:bg-gray-50 transition duration-300">
            Sign Up
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-green-800 mb-2">100% Natural</h3>
            <p className="text-gray-600">Authentic Ayurvedic herbs sourced directly from nature.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-green-800 mb-2">Certified Quality</h3>
            <p className="text-gray-600">GMP and ISA certified products ensuring safety and efficacy.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-green-800 mb-2">Expert Consultation</h3>
            <p className="text-gray-600">Get advice from experienced Vaidyas for your health concerns.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
