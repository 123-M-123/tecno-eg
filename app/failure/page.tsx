import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function FailurePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
          <CardDescription>
            Unfortunately, your payment could not be processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Please try again</p>
                <p className="text-sm text-red-700">
                  Check your payment details and try again
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Shop
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                Try Again
              </Button>
            </Link>
          </div>

          <p className="text-center text-sm text-gray-600">
            Questions? Contact us at support@audiostore.com
          </p>
        </CardContent>
      </Card>
    </div>
  );
}