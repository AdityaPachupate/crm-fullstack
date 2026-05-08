using CRM.API.Domain;
using CRM.API.Common.Enums;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Infrastructure.Persistence
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext db)
        {
            // Clear existing data for a fresh start
            db.BillPayments.RemoveRange(db.BillPayments);
            db.BillItems.RemoveRange(db.BillItems);
            db.Bills.RemoveRange(db.Bills);
            db.RejoinRecords.RemoveRange(db.RejoinRecords);
            db.Enrollments.RemoveRange(db.Enrollments);
            db.FollowUps.RemoveRange(db.FollowUps);
            db.Leads.RemoveRange(db.Leads);
            db.LookupValues.RemoveRange(db.LookupValues);
            db.Packages.RemoveRange(db.Packages);
            db.Medicines.RemoveRange(db.Medicines);
            await db.SaveChangesAsync();

            // 1. Seed Lookups
            var lookupValues = new List<LookupValue>
            {
                new() { Category = "Source", Code = "Facebook", DisplayName = "Facebook", CreatedAt = DateTime.UtcNow },
                new() { Category = "Source", Code = "Instagram", DisplayName = "Instagram", CreatedAt = DateTime.UtcNow },
                new() { Category = "Source", Code = "Google", DisplayName = "Google", CreatedAt = DateTime.UtcNow },
                new() { Category = "Source", Code = "WordOfMouth", DisplayName = "Word of Mouth", CreatedAt = DateTime.UtcNow },
                new() { Category = "Source", Code = "Walking", DisplayName = "Walking", CreatedAt = DateTime.UtcNow },
            };
            db.LookupValues.AddRange(lookupValues);

            // 2. Seed Packages
            var packages = new List<Package>
            {
                new() { Name = "Weight Loss Pro (90 Days)", DurationInDays = 90, Cost = 18000, CreatedAt = DateTime.UtcNow },
                new() { Name = "Diabetes Management (180 Days)", DurationInDays = 180, Cost = 35000, CreatedAt = DateTime.UtcNow },
                new() { Name = "Skin Glow Therapy (30 Days)", DurationInDays = 30, Cost = 7500, CreatedAt = DateTime.UtcNow },
                new() { Name = "PCOD/PCOS Control (120 Days)", DurationInDays = 120, Cost = 22000, CreatedAt = DateTime.UtcNow },
                new() { Name = "Joint Pain Relief (60 Days)", DurationInDays = 60, Cost = 12000, CreatedAt = DateTime.UtcNow },
                new() { Name = "Basic Health Shield (15 Days)", DurationInDays = 15, Cost = 3000, CreatedAt = DateTime.UtcNow },
            };
            db.Packages.AddRange(packages);

            // 3. Seed Medicines
            var medicines = new List<Medicine>
            {
                new() { Name = "Herbal Detox Capsules", Price = 850, IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Ayurvedic Pain Oil", Price = 450, IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Metabolic Booster", Price = 1200, IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Omega-3 Supplements", Price = 1500, IsActive = true, CreatedAt = DateTime.UtcNow },
                new() { Name = "Multivitamin Complex", Price = 600, IsActive = true, CreatedAt = DateTime.UtcNow },
            };
            db.Medicines.AddRange(medicines);

            await db.SaveChangesAsync();

            // 4. Seed 20 Leads
            var leadsData = new (string Name, string Phone, LeadStatus Status, string Source, int DaysAgo)[]
            {
                ("Rahul Sharma", "9876543210", LeadStatus.Converted, "Facebook", 100),
                ("Anjali Gupta", "8765432109", LeadStatus.Converted, "Instagram", 80),
                ("Vikram Singh", "7654321098", LeadStatus.Consulted, "Google", 12),
                ("Sneha Patel", "9988776655", LeadStatus.Converted, "WordOfMouth", 45),
                ("Amit Verma", "8877665544", LeadStatus.Converted, "Walking", 60),
                ("Priya Reddy", "7766554433", LeadStatus.New, "Facebook", 1),
                ("Rajesh Kumar", "9123456780", LeadStatus.Consulted, "Instagram", 8),
                ("Deepika Padukone", "9234567891", LeadStatus.Contacted, "Google", 15),
                ("Sanjay Dutt", "9345678902", LeadStatus.Converted, "Walking", 120),
                ("Kriti Sanon", "9456789013", LeadStatus.New, "Facebook", 2),
                ("Arjun Kapoor", "9567890124", LeadStatus.Lost, "Google", 20),
                ("Sara Ali Khan", "9678901235", LeadStatus.Consulted, "Instagram", 3),
                ("Ranbir Kapoor", "9789012346", LeadStatus.Converted, "WordOfMouth", 50),
                ("Alia Bhatt", "9890123457", LeadStatus.Converted, "Facebook", 55),
                ("Varun Dhawan", "9901234568", LeadStatus.Contacted, "Instagram", 10),
                ("Katrina Kaif", "9012345679", LeadStatus.Consulted, "Google", 7),
                ("Vicky Kaushal", "8123456789", LeadStatus.New, "Walking", 4),
                ("Ayushmann Khurrana", "8234567890", LeadStatus.Converted, "Facebook", 35),
                ("Rajkummar Rao", "8345678901", LeadStatus.Converted, "WordOfMouth", 25),
                ("Pankaj Tripathi", "8456789012", LeadStatus.Contacted, "Google", 18)
            };

            var leads = new List<Lead>();
            foreach (var l in leadsData)
            {
                leads.Add(new Lead 
                { 
                    Name = l.Name, 
                    Phone = l.Phone, 
                    Status = l.Status, 
                    Source = l.Source, 
                    CreatedAt = DateTime.UtcNow.AddDays(-l.DaysAgo) 
                });
            }
            db.Leads.AddRange(leads);
            await db.SaveChangesAsync();

            var rnd = new Random();

            // 5. Seed Follow-ups
            foreach (var lead in leads)
            {
                db.FollowUps.Add(new FollowUp 
                { 
                    LeadId = lead.Id, 
                    FollowUpDate = DateOnly.FromDateTime(lead.CreatedAt.AddDays(1)),
                    Status = FollowUpStatus.Completed,
                    Priority = FollowUpPriority.Medium,
                    Notes = "Initial reach out.",
                    CompletedAt = lead.CreatedAt.AddDays(1),
                    Outcome = FollowUpOutcome.CallbackRequested,
                    CreatedAt = lead.CreatedAt
                });

                if (lead.Status != LeadStatus.Converted && lead.Status != LeadStatus.Lost)
                {
                    int offset = rnd.Next(-5, 10);
                    db.FollowUps.Add(new FollowUp 
                    { 
                        LeadId = lead.Id, 
                        FollowUpDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(offset)),
                        Status = FollowUpStatus.Pending,
                        Priority = offset < 0 ? FollowUpPriority.High : (rnd.Next(2) == 0 ? FollowUpPriority.Medium : FollowUpPriority.Low),
                        Notes = offset < 0 ? "URGENT: Re-engagement needed." : "Routine follow-up.",
                        CreatedAt = DateTime.UtcNow.AddDays(-1)
                    });
                }
            }
            await db.SaveChangesAsync();

            // 6. Seed Enrollments, Rejoins, Bills & Payments
            var convertedLeads = leads.Where(l => l.Status == LeadStatus.Converted).ToList();
            foreach (var lead in convertedLeads)
            {
                if (lead.Name == "Rahul Sharma" || lead.Name == "Sanjay Dutt")
                {
                    // Past enrollment
                    var oldPkg = packages[rnd.Next(packages.Count)];
                    var oldStart = DateOnly.FromDateTime(lead.CreatedAt.AddDays(5));
                    var oldEnd = oldStart.AddDays(oldPkg.DurationInDays);
                    
                    var oldEnrollment = new Enrollment
                    {
                        LeadId = lead.Id, PackageId = oldPkg.Id, 
                        StartDate = oldStart, EndDate = oldEnd, 
                        PackageCostSnapshot = oldPkg.Cost, PackageDurationSnapshot = oldPkg.DurationInDays,
                        CreatedAt = DateTime.SpecifyKind(lead.CreatedAt.AddDays(5), DateTimeKind.Utc)
                    };
                    db.Enrollments.Add(oldEnrollment);
                    await db.SaveChangesAsync();
                    await CreateBillWithPayments(db, oldEnrollment, null, lead, true);

                    // Add a Rejoin
                    var newPkg = packages[rnd.Next(packages.Count)];
                    var newStart = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10));
                    var newEnd = newStart.AddDays(newPkg.DurationInDays);

                    var rejoin = new RejoinRecord
                    {
                        LeadId = lead.Id,
                        PackageId = newPkg.Id,
                        PackageCostSnapshot = newPkg.Cost,
                        PackageDurationSnapshot = newPkg.DurationInDays,
                        StartDate = newStart,
                        EndDate = newEnd,
                        CreatedAt = DateTime.UtcNow.AddDays(-10)
                    };
                    db.RejoinRecords.Add(rejoin);
                    await db.SaveChangesAsync();
                    await CreateBillWithPayments(db, null, rejoin, lead, false);
                }
                else
                {
                    var pkg = packages[rnd.Next(packages.Count)];
                    var start = DateOnly.FromDateTime(lead.CreatedAt.AddDays(rnd.Next(2, 10)));
                    var end = start.AddDays(pkg.DurationInDays);
                    
                    var enrollment = new Enrollment
                    {
                        LeadId = lead.Id, PackageId = pkg.Id,
                        StartDate = start, EndDate = end,
                        PackageCostSnapshot = pkg.Cost, PackageDurationSnapshot = pkg.DurationInDays,
                        CreatedAt = DateTime.SpecifyKind(start.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc)
                    };
                    db.Enrollments.Add(enrollment);
                    await db.SaveChangesAsync();

                    bool fullyPaid = rnd.Next(10) > 6;
                    await CreateBillWithPayments(db, enrollment, null, lead, fullyPaid);
                }
            }

            await db.SaveChangesAsync();
        }

        private static async Task CreateBillWithPayments(AppDbContext db, Enrollment? enrollment, RejoinRecord? rejoin, Lead lead, bool fullyPaid)
        {
            var rnd = new Random();
            var medicines = await db.Medicines.ToListAsync();
            
            var bill = new Bill
            {
                EnrollmentId = enrollment?.Id,
                RejoinRecordId = rejoin?.Id,
                LeadId = lead.Id,
                InitialAmount = enrollment?.PackageCostSnapshot ?? rejoin?.PackageCostSnapshot ?? 0,
                AmountPaid = 0,
                PendingAmount = enrollment?.PackageCostSnapshot ?? rejoin?.PackageCostSnapshot ?? 0,
                CreatedAt = DateTime.SpecifyKind(enrollment?.CreatedAt ?? rejoin?.CreatedAt ?? DateTime.UtcNow, DateTimeKind.Utc)
            };
            db.Bills.Add(bill);
            await db.SaveChangesAsync();

            // Add 1-2 Medicines as Bill Items
            int medCount = rnd.Next(1, 3);
            for (int i = 0; i < medCount; i++)
            {
                var med = medicines[rnd.Next(medicines.Count)];
                var qty = rnd.Next(1, 4);
                var item = new BillItem
                {
                    BillId = bill.Id,
                    MedicineId = med.Id,
                    Quantity = qty,
                    UnitPriceSnapshot = med.Price
                };
                db.BillItems.Add(item);
                bill.MedicineBillingAmount += med.Price * qty;
                bill.PendingAmount += med.Price * qty;
            }

            if (fullyPaid)
            {
                var total = bill.InitialAmount + bill.MedicineBillingAmount;
                db.BillPayments.Add(new BillPayment
                {
                    BillId = bill.Id, Amount = total,
                    DatePaid = DateTime.SpecifyKind(bill.CreatedAt.AddDays(rnd.Next(0, 5)), DateTimeKind.Utc)
                });
                bill.AmountPaid = total;
                bill.PendingAmount = 0;
            }
            else
            {
                int payments = rnd.Next(1, 3);
                for (int i = 0; i < payments; i++)
                {
                    decimal total = bill.InitialAmount + bill.MedicineBillingAmount;
                    decimal payAmt = Math.Floor(total * (decimal)(rnd.NextDouble() * 0.4 + 0.1));
                    if (payAmt > bill.PendingAmount) payAmt = bill.PendingAmount;
                    if (payAmt <= 0) continue;

                    db.BillPayments.Add(new BillPayment
                    {
                        BillId = bill.Id, Amount = payAmt,
                        DatePaid = DateTime.SpecifyKind(bill.CreatedAt.AddDays(i * 15), DateTimeKind.Utc)
                    });
                    bill.AmountPaid += payAmt;
                    bill.PendingAmount -= payAmt;
                }
            }
            await db.SaveChangesAsync();
        }
    }
}
