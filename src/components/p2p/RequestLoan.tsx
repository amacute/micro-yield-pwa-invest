import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RequestLoan: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Implement loan request submission
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Request a Loan</CardTitle>
        <CardDescription>
          Fill out the form below to request a loan. We'll review your application
          and match you with potential lenders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Loan Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              required
              min="100"
              step="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Loan Duration</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Loan Purpose</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Loan Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about your loan request"
              required
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collateral">Collateral (Optional)</Label>
            <Input
              id="collateral"
              type="text"
              placeholder="Describe any collateral you're offering"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferred-rate">Preferred Interest Rate (%)</Label>
            <Input
              id="preferred-rate"
              type="number"
              placeholder="Enter preferred rate"
              required
              min="1"
              max="30"
              step="0.1"
            />
            <p className="text-sm text-gray-500">
              Note: The actual rate may vary based on your credit score and lender offers
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Loan Request"}
            </Button>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RequestLoan; 