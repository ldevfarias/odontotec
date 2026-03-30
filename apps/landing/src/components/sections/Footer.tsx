import Link from "next/link";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-background py-16 md:py-24 border-t border-border">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-8 border-b border-border pb-10 md:pb-12 mb-8">
          <div className="md:col-span-2">
            <span className="font-display font-bold text-3xl tracking-tighter text-foreground mb-4 block">
              Odonto<span className="text-primary">Eh</span>Tec
            </span>
            <p className="body-small max-w-xs mb-6">
              Redefinindo a gestão odontológica com design inteligente e transparência de preços.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-gray-50 transition-colors">
                <span className="sr-only">Instagram</span>
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-gray-50 transition-colors">
                <span className="sr-only">LinkedIn</span>
                <LinkedInIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Produto</h4>
            <ul className="space-y-3">
              <li><Link href="/funcionalidades" className="body-small hover:text-foreground transition-colors">Funcionalidades</Link></li>
              <li><Link href="/precos" className="body-small hover:text-foreground transition-colors">Planos & Preços</Link></li>
              <li><Link href="/#faq" className="body-small hover:text-foreground transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Empresa</h4>
            <ul className="space-y-3">
              <li><Link href="/sobre" className="body-small hover:text-foreground transition-colors">Sobre</Link></li>
              <li><a href="#" className="body-small hover:text-foreground transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="body-small hover:text-foreground transition-colors">Privacidade</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OdontoEhTec. Todos os direitos reservados.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Feito com <span className="text-primary">♥</span> no Brasil
          </p>
        </div>
      </div>
    </footer>
  );
}
