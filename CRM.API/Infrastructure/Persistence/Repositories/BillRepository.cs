using CRM.API.Common.Interfaces;
using CRM.API.Domain;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Infrastructure.Persistence.Repositories
{
    public class BillRepository(AppDbContext db) : IBillRepository
    {
        public async Task<Bill> CreateBillWithItemsAsync(
            Bill bill, 
            IEnumerable<(Guid MedicineId, int Quantity)> medicineItems, 
            CancellationToken ct)
        {
            decimal medicineTotal = 0;
            
            if (medicineItems != null && medicineItems.Any())
            {
                var medicineIds = medicineItems.Select(i => i.MedicineId).ToList();
                var medicines = await db.Medicines
                    .Where(m => medicineIds.Contains(m.Id))
                    .ToListAsync(ct);

                foreach (var itemReq in medicineItems)
                {
                    var med = medicines.FirstOrDefault(m => m.Id == itemReq.MedicineId);
                    if (med != null)
                    {
                        var billItem = new BillItem
                        {
                            MedicineId = med.Id,
                            Quantity = itemReq.Quantity,
                            UnitPriceSnapshot = med.Price
                        };
                        bill.Items.Add(billItem);
                        medicineTotal += (med.Price * itemReq.Quantity);
                    }
                }
            }

            bill.MedicineBillingAmount = medicineTotal;
            
            // Sync initial payment to relational table if present
            if (bill.AmountPaid > 0 && !bill.Payments.Any())
            {
                bill.Payments.Add(new BillPayment 
                { 
                    Id = Guid.NewGuid(),
                    Amount = bill.AmountPaid, 
                    DatePaid = DateTime.UtcNow 
                });
            }

            RecalculateTotals(bill);

            db.Bills.Add(bill);
            await db.SaveChangesAsync(ct);
            
            return bill;
        }

        public async Task<List<Bill>> GetLeadBillsAsync(Guid leadId, CancellationToken ct)
        {
            return await db.Bills
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Include(b => b.Enrollment)
                    .ThenInclude(e => e!.Package)
                .Include(b => b.RejoinRecord)
                    .ThenInclude(r => r!.Package)
                .Include(b => b.Items)
                    .ThenInclude(i => i.Medicine)
                .Include(b => b.Payments)
                .Where(b => b.LeadId == leadId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync(ct);
        }

        public async Task UpdateBillAsync(Bill bill, CancellationToken ct)
        {
            db.Bills.Update(bill);
            await db.SaveChangesAsync(ct);
        }

        public async Task UpdateBillWithItemsAsync(
            Guid billId, 
            decimal? initialAmount,
            decimal? amountPaid, 
            IEnumerable<(Guid MedicineId, int Quantity)>? items, 
            CancellationToken ct)
        {
            var bill = await db.Bills
                .IgnoreQueryFilters()
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == billId, ct);
            
            if (bill == null) return;

            if (initialAmount.HasValue) bill.InitialAmount = initialAmount.Value;
            
            // Note: In relational mode, we don't directly update AmountPaid.
            // But if this is a Create-style update or legacy sync, we can handle it.
            if (amountPaid.HasValue && !bill.Payments.Any())
            {
                bill.Payments.Add(new BillPayment 
                { 
                    Id = Guid.NewGuid(),
                    Amount = amountPaid.Value, 
                    DatePaid = DateTime.UtcNow 
                });
            }

            if (items != null)
            {
                var newItemsList = items.ToList();
                var oldItems = bill.Items.ToList();
                
                db.BillItems.RemoveRange(bill.Items);
                bill.Items.Clear();

                var medicineIds = newItemsList.Select(i => i.MedicineId).ToList();
                var medicines = await db.Medicines.Where(m => medicineIds.Contains(m.Id)).ToListAsync(ct);

                foreach (var itemReq in newItemsList)
                {
                    var med = medicines.FirstOrDefault(m => m.Id == itemReq.MedicineId);
                    if (med != null)
                    {
                        var existingItem = oldItems.FirstOrDefault(oi => oi.MedicineId == itemReq.MedicineId);
                        
                        bill.Items.Add(new BillItem
                        {
                            BillId = bill.Id,
                            MedicineId = med.Id,
                            Quantity = itemReq.Quantity,
                            UnitPriceSnapshot = existingItem?.UnitPriceSnapshot ?? med.Price
                        });
                    }
                }
            }

            RecalculateTotals(bill);

            await db.SaveChangesAsync(ct);
        }

        public async Task DetachBillFromEnrollmentAsync(Guid enrollmentId, CancellationToken ct)
        {
            var bill = await db.Bills
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.EnrollmentId == enrollmentId, ct);
            if (bill != null)
            {
                bill.EnrollmentId = null; // Unlink but keep the record
                await db.SaveChangesAsync(ct);
            }
        }

        public async Task ReattachBillToEnrollmentAsync(Guid enrollmentId, CancellationToken ct)
        {
            // Implementation for reattaching if needed
            await Task.CompletedTask;
        }

        public async Task DetachBillFromRejoinAsync(Guid rejoinId, CancellationToken ct)
        {
            var bill = await db.Bills
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.RejoinRecordId == rejoinId, ct);
            if (bill != null)
            {
                bill.RejoinRecordId = null; // Unlink but keep the record
                await db.SaveChangesAsync(ct);
            }
        }

        public async Task ReattachBillToRejoinAsync(Guid rejoinId, Guid billId, CancellationToken ct)
        {
            var bill = await db.Bills
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(b => b.Id == billId, ct);
            if (bill != null)
            {
                bill.RejoinRecordId = rejoinId;
                await db.SaveChangesAsync(ct);
            }
        }

        public async Task AddMedicineToBillAsync(Guid billId, IEnumerable<(Guid MedicineId, int Quantity)> items, CancellationToken ct)
        {
            var bill = await db.Bills
                .IgnoreQueryFilters()
                .Include(b => b.Items)
                .FirstOrDefaultAsync(b => b.Id == billId, ct);
            if (bill == null) return;

            var medicineIds = items.Select(i => i.MedicineId).ToList();
            var medicines = await db.Medicines.Where(m => medicineIds.Contains(m.Id)).ToListAsync(ct);

            foreach (var item in items)
            {
                var med = medicines.FirstOrDefault(m => m.Id == item.MedicineId);
                if (med != null)
                {
                    bill.Items.Add(new BillItem
                    {
                        BillId = bill.Id,
                        MedicineId = med.Id,
                        Quantity = item.Quantity,
                        UnitPriceSnapshot = med.Price
                    });
                }
            }

            RecalculateTotals(bill);
            await db.SaveChangesAsync(ct);
        }

        public void RecalculateTotals(Bill bill)
        {
            bill.MedicineBillingAmount = bill.Items.Sum(i => i.Quantity * i.UnitPriceSnapshot);
            bill.AmountPaid = bill.Payments.Where(p => !p.IsDeleted).Sum(p => p.Amount);
            bill.PendingAmount = (bill.InitialAmount + bill.MedicineBillingAmount) - bill.AmountPaid;
        }
    }
}
