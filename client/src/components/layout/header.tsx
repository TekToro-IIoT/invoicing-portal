import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-tektoro-dark border-b border-gray-600 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="text-gray-400">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            className="bg-tektoro-primary hover:bg-green-600 text-white"
            onClick={() => window.location.href = '/invoices'}
          >
            <i className="fas fa-plus mr-2"></i>
            New Invoice
          </Button>
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-300">
              <i className="fas fa-bell text-xl"></i>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
