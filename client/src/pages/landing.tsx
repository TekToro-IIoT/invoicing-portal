import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import logoPath from "@assets/Untitled design (89).png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-tektoro-bg flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-8">
          <div className="w-full max-w-2xl h-24 flex items-center justify-center">
            <img 
              src={logoPath} 
              alt="TekToro Digital IIoT Solutions Logo" 
              className="w-full h-full object-contain"
              style={{ maxWidth: '100%' }}
            />
          </div>
        </div>

        <Card className="max-w-2xl mx-auto invoice-shadow bg-tektoro-dark border-gray-600">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Professional Invoice Management
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Streamline your billing process with our professional invoice management solution. 
              Built with SCADA-inspired design for professional reliability.
            </p>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-tektoro-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-file-invoice text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-white mb-2">Invoice Management</h3>
                <p className="text-sm text-gray-400">Create, send, and track professional invoices with PDF generation</p>
              </div>
            </div>

            <Button 
              size="lg" 
              className="bg-tektoro-primary hover:bg-green-600 text-white px-8 py-3"
              onClick={() => window.location.href = '/api/login'}
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              Sign In to Get Started
            </Button>

            <div className="mt-6 pt-6 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                Secure authentication powered by professional-grade infrastructure
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
