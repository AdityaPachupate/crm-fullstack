import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, CreditCard, Pill, Printer, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { BillDetailDto } from '@/api/bills.api';

interface BillCardProps {
  bill: BillDetailDto;
  onAddPayment: (billId: string) => void;
  patientName?: string;
}

export function BillCard({ bill, onAddPayment, patientName }: BillCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pending = bill.pendingAmount;
  const isPaid = pending <= 0;
  
  // Parse payment history
  let paymentHistory: { date: string; amount: number }[] = [];
  try {
    paymentHistory = JSON.parse(bill.paymentHistoryJson || '[]');
  } catch (e) {
    console.error('Failed to parse payment history', e);
  }

  const handlePrint = () => {
    const isPaid = bill.pendingAmount <= 0;
    const paymentHistory = (() => {
      try {
        return JSON.parse(bill.paymentHistoryJson || '[]');
      } catch {
        return [];
      }
    })();

    // Create a unique filename for the PDF (used as document title)
    const formattedDate = new Date(bill.createdAt).toLocaleDateString().replace(/\//g, '-');
    const docTitle = `Bill_${formattedDate}_${patientName || 'Patient'}`;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.write(`
        <html>
          <head>
            <title>${docTitle}</title>
            <style>
              @page { size: auto; margin: 0mm; }
              body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.5; }
              .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; }
              .header h1 { margin: 0; color: #4f46e5; font-size: 28px; letter-spacing: 1px; }
              .header p { margin: 5px 0 0; color: #666; font-weight: bold; text-transform: uppercase; font-size: 12px; }
              .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px; }
              .bill-info p { margin: 4px 0; font-size: 14px; }
              .section { margin-bottom: 30px; }
              .section-title { font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase; font-size: 13px; color: #64748b; letter-spacing: 0.5px; }
              table { width: 100%; border-collapse: collapse; }
              th { text-align: left; padding: 12px 10px; background: #f1f5f9; font-size: 11px; color: #475569; text-transform: uppercase; }
              td { padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
              .totals { margin-top: 20px; text-align: right; border-top: 2px solid #f1f5f9; padding-top: 20px; }
              .total-row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 10px; }
              .total-label { color: #64748b; font-size: 14px; }
              .total-value { font-weight: bold; min-width: 120px; font-size: 14px; }
              .grand-total { font-size: 18px; color: #0f172a; margin-top: 10px; padding-top: 10px; }
              .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>PARASNATH</h1>
              <p>Certified Payment Receipt</p>
            </div>
            
            <div class="bill-info">
              <div>
                <p><strong>Patient Name:</strong> ${patientName || 'N/A'}</p>
                <p><strong>Bill ID:</strong> ${bill.id.toUpperCase().substring(0, 8)}</p>
              </div>
              <div style="text-align: right">
                <p><strong>Date:</strong> ${new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                <p><strong>Payment Status:</strong> <span style="color: ${isPaid ? '#059669' : '#e11d48'}">${isPaid ? 'COMPLETED' : 'PENDING'}</span></p>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Invoice Items</div>
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th style="text-align: right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${bill.initialAmount > 0 ? `
                    <tr>
                      <td>${bill.packageName || 'Treatment Package'}</td>
                      <td>1</td>
                      <td>₹${(bill.initialAmount || 0).toLocaleString()}</td>
                      <td style="text-align: right">₹${(bill.initialAmount || 0).toLocaleString()}</td>
                    </tr>
                  ` : ''}
                  ${bill.items.map(item => `
                    <tr>
                      <td>${item.medicineName}</td>
                      <td>${item.quantity}</td>
                      <td>₹${(item.unitPriceAtSale || 0).toLocaleString()}</td>
                      <td style="text-align: right">₹${((item.quantity || 0) * (item.unitPriceAtSale || 0)).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="totals">
              <div class="total-row">
                <span class="total-label">Subtotal</span>
                <span class="total-value">₹${((bill.initialAmount || 0) + (bill.medicineBillingAmount || 0)).toLocaleString()}</span>
              </div>
              <div class="total-row">
                <span class="total-label">Total Paid Amount</span>
                <span style="color: #059669" class="total-value">₹${(bill.amountPaid || 0).toLocaleString()}</span>
              </div>
              <div class="total-row grand-total">
                <span class="total-label">Outstanding Balance</span>
                <span style="color: ${bill.pendingAmount > 0 ? '#e11d48' : '#0f172a'}" class="total-value">₹${(bill.pendingAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div class="section" style="margin-top: 40px">
              <div class="section-title">Transaction History</div>
              <table style="font-size: 11px">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th style="text-align: right">Amount Received</th>
                  </tr>
                </thead>
                <tbody>
                  ${paymentHistory.map((p: any) => `
                    <tr>
                      <td>${new Date(p.date || p.Date || bill.createdAt).toLocaleDateString()}</td>
                      <td>Installment Payment</td>
                      <td style="text-align: right">₹${(p.amount || p.Amount || 0).toLocaleString()}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="footer">
              <p>This is a system generated document. For any queries, please provide the Bill ID mention above.</p>
              <p>© ${new Date().getFullYear()} Parasnath CRM. All rights reserved.</p>
            </div>
          </body>
        </html>
      `);
      doc.close();

      // Give it a moment to load styles before printing
      setTimeout(() => {
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          // Remove the iframe after a delay to ensure print dialog finished
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }
      }, 500);
    }
  };

  return (
    <Card className="border shadow-none overflow-hidden transition-all duration-300 hover:border-indigo-200">
      <CardContent className="p-0">
        {/* Main Header */}
        <div className="p-4 flex items-center justify-between bg-white">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill Date</span>
            <p className="text-sm font-bold text-slate-900">{new Date(bill.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-[10px] font-bold uppercase py-1 px-2.5 rounded-full",
              isPaid ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
            )}>
              {isPaid ? 'Settled' : `${formatCurrency(pending)} Due`}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
              onClick={handlePrint}
              title="Print Receipt"
            >
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="px-4 py-3 bg-slate-50/50 border-y border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</p>
              <p className="text-[13px] font-bold text-slate-900">{formatCurrency((bill.initialAmount || 0) + (bill.medicineBillingAmount || 0))}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</p>
              <p className="text-[13px] font-bold text-emerald-600">{formatCurrency(bill.amountPaid)}</p>
            </div>
          </div>
          
          {!isPaid && (
            <Button 
              size="sm" 
              className="h-7 px-3 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-transform active:scale-95"
              onClick={() => onAddPayment(bill.id)}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Payment
            </Button>
          )}
        </div>

        {/* Expandable Sections */}
        <div className="border-t border-slate-100">
          <button 
            className="w-full px-4 py-2.5 flex items-center justify-between text-[11px] font-bold text-slate-500 hover:bg-slate-50/50 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="flex items-center gap-1.5 uppercase tracking-wider">
              {isExpanded ? 'Hide Details' : 'View Details & History'}
            </span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {isExpanded && (
            <div className="px-4 pb-4 space-y-5 animate-in slide-in-from-top-2 duration-300">
              {/* Medicine Breakdown */}
              {bill.items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Pill className="h-3 w-3" /> Medicine Items
                  </div>
                  <div className="space-y-1.5">
                    {bill.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg group">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{item.medicineName}</span>
                          <span className="text-[10px] text-slate-400">Qty: {item.quantity} × {formatCurrency(item.unitPriceAtSale)}</span>
                        </div>
                        <span className="font-bold text-slate-900">{formatCurrency(item.quantity * item.unitPriceAtSale)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Package Snapshot */}
              {bill.initialAmount > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <CreditCard className="h-3 w-3" /> Package Details
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 bg-indigo-50/30 rounded-lg border border-indigo-50">
                    <span className="font-semibold text-indigo-700">Treatment Package</span>
                    <span className="font-bold text-indigo-900">{formatCurrency(bill.initialAmount)}</span>
                  </div>
                </div>
              )}

              {/* Payment History */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <CreditCard className="h-3 w-3" /> Payment History
                </div>
                <div className="space-y-1">
                  {paymentHistory.length > 0 ? (
                    paymentHistory.map((p: any, idx) => {
                      const amount = p.amount ?? p.Amount ?? 0;
                      const date = p.date ?? p.Date ?? bill.createdAt;
                      return (
                        <div key={idx} className="flex items-center justify-between text-xs py-1.5 px-2 border-l-2 border-emerald-500 bg-emerald-50/10 ml-1">
                          <div className="flex flex-col">
                            <span className="font-medium text-slate-600">{new Date(date).toLocaleDateString()}</span>
                            {idx === 0 && <span className="text-[9px] text-emerald-600 font-bold uppercase">Initial Advance</span>}
                          </div>
                          <span className="font-bold text-emerald-700">+{formatCurrency(amount)}</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-slate-400 italic px-2">No payments recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
