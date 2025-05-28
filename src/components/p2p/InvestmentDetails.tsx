import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Payment {
  date: string;
  amount: number;
  type: 'principal' | 'interest';
  status: 'pending' | 'paid' | 'late';
}

interface InvestmentDetailsProps {
  investment: {
    id: string;
    borrower: string;
    principalAmount: number;
    interestRate: number;
    duration: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'defaulted';
    paymentsReceived: number;
    totalPayments: number;
    paymentSchedule: Payment[];
  };
}

const InvestmentDetails: React.FC<InvestmentDetailsProps> = ({ investment }) => {
  const calculateProgress = () => {
    return (investment.paymentsReceived / investment.totalPayments) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'late':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateReturns = () => {
    const monthlyRate = investment.interestRate / 12 / 100;
    const monthlyPayment = (investment.principalAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -investment.duration));
    const totalReturn = monthlyPayment * investment.duration - investment.principalAmount;
    return totalReturn.toFixed(2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Investment Overview
            <Badge>{investment.status}</Badge>
          </CardTitle>
          <CardDescription>
            Investment ID: {investment.id}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Principal</h4>
              <p className="text-2xl font-bold">${investment.principalAmount}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Interest Rate</h4>
              <p className="text-2xl font-bold">{investment.interestRate}%</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Expected Return</h4>
              <p className="text-2xl font-bold text-green-600">${calculateReturns()}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Duration</h4>
              <p className="text-2xl font-bold">{investment.duration} months</p>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{investment.paymentsReceived}/{investment.totalPayments} payments</span>
            </div>
            <Progress value={calculateProgress()} className="h-2" />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Schedule</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {investment.paymentSchedule.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell className="capitalize">{payment.type}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex gap-4">
            <Button variant="outline">Download Statement</Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700">
              Report Issue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentDetails; 