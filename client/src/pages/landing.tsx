import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen bg-tektoro-bg flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="w-16 h-16 flex items-center justify-center">
            <img 
              src="/attached_assets/tektoro-logo.png" 
              alt="TekToro Logo" 
              className="w-12 h-12 object-contain"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-tektoro-primary">TekToro</h1>
            <p className="text-lg text-gray-300">Invoice & Time Tracking</p>
          </div>
        </div>

        <Card className="max-w-2xl mx-auto invoice-shadow bg-tektoro-dark border-gray-600">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Professional Invoice Management
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Streamline your billing process with our comprehensive invoice and time-tracking solution. 
              Built with SCADA-inspired design for professional reliability.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-tektoro-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-file-invoice text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-white mb-2">Invoice Management</h3>
                <p className="text-sm text-gray-400">Create, send, and track professional invoices with PDF generation</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-tektoro-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-clock text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-white mb-2">Time Tracking</h3>
                <p className="text-sm text-gray-400">Track billable hours with precision timing and project management</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-tektoro-primary rounded-lg flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-chart-bar text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-white mb-2">Analytics</h3>
                <p className="text-sm text-gray-400">Comprehensive reporting and insights for your business</p>
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
