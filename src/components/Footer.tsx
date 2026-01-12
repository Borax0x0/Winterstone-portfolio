import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-900 text-white py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* LOGO */}
        <div className="text-3xl font-serif font-bold tracking-widest mb-12">
          WINTERSTONE
        </div>
        
        {/* LINKS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-16 mb-16 font-josefin">
           
           <div className="flex flex-col gap-4">
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Contact & Arrival
             </Link>
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Newsletter
             </Link>
           </div>

           <div className="flex flex-col gap-4">
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Careers
             </Link>
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Press
             </Link>
           </div>

           <div className="flex flex-col gap-4">
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Legal Notice
             </Link>
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Privacy Policy
             </Link>
           </div>
           
           <div className="flex flex-col gap-4">
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Instagram
             </Link>
             <Link href="#" className="text-xs font-light tracking-[0.2em] uppercase hover:text-saffron transition-colors">
               Facebook
             </Link>
           </div>

        </div>

        {/* COPYRIGHT */}
        <div className="text-[10px] text-white/40 tracking-widest uppercase font-light font-josefin">
          © 2024 Winterstone Luxury Alpine Escape
        </div>

      </div>
    </footer>
  );
}