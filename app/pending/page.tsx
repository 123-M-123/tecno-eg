import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import Link from "next/link";

export default function PendingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-yellow-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Clock className="w-12 h-12 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-600">Payment Pending</CardTitle>
          <CardDescription>
            Your payment is being processed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-900">
              Your payment is being verified. This may take a few moments.
              You'll receive a confirmation email once it's complete.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Shop
              </Button>
            </Link>
            <Link href="/success" className="flex-1">
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                Check Status
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