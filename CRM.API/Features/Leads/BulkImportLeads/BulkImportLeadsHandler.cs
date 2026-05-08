using CRM.API.Common.Enums;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using CsvHelper;
using CsvHelper.Configuration;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace CRM.API.Features.Leads.BulkImportLeads
{
    public class BulkImportLeadsHandler : IRequestHandler<BulkImportLeadsCommand, BulkImportLeadsResponse>
    {
        private readonly AppDbContext _db;

        public BulkImportLeadsHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<BulkImportLeadsResponse> Handle(BulkImportLeadsCommand request, CancellationToken cancellationToken)
        {
            var errors = new List<string>();
            int total = 0;
            int success = 0;
            int duplicates = 0;

            try
            {
                using var reader = new StreamReader(request.File.OpenReadStream());
                using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HeaderValidated = null,
                    MissingFieldFound = null,
                    PrepareHeaderForMatch = args => args.Header.ToLower().Trim()
                });

                var records = csv.GetRecords<LeadCsvRecord>().ToList();
                total = records.Count;

                // Get existing lookups for sources to avoid redundant DB calls
                var existingSources = await _db.LookupValues
                    .Where(l => l.Category == "Source")
                    .Select(l => l.Code.ToLower())
                    .ToListAsync(cancellationToken);

                foreach (var record in records)
                {
                    try
                    {
                        if (string.IsNullOrWhiteSpace(record.Name) || string.IsNullOrWhiteSpace(record.Phone))
                        {
                            errors.Add($"Row {success + duplicates + errors.Count + 1}: Name and Phone are required.");
                            continue;
                        }

                        var phone = record.Phone.Trim();

                        // Check for existing phone number
                        var exists = await _db.Leads.AnyAsync(l => l.Phone == phone, cancellationToken);
                        if (exists)
                        {
                            duplicates++;
                            continue;
                        }

                        // Handle Source (Auto-add to lookups if new)
                        var source = record.Source?.Trim() ?? "Imported";
                        if (!existingSources.Contains(source.ToLower()))
                        {
                            var newLookup = new LookupValue
                            {
                                Category = "Source",
                                Code = source,
                                DisplayName = source,
                                CreatedAt = DateTime.UtcNow
                            };
                            _db.LookupValues.Add(newLookup);
                            existingSources.Add(source.ToLower()); // Add to local list to avoid duplicates in same batch
                        }

                        var lead = new Lead
                        {
                            Name = record.Name.Trim(),
                            Phone = phone,
                            Source = source,
                            Reason = record.Reason?.Trim() ?? string.Empty,
                            CreatedAt = DateTime.UtcNow,
                            Status = MapStatus(record.Status)
                        };

                        _db.Leads.Add(lead);
                        success++;
                    }
                    catch (Exception ex)
                    {
                        errors.Add($"Error processing record {record.Name}: {ex.Message}");
                    }
                }

                if (success > 0 || errors.Count < total) // Save if we have some successes or even just new lookups
                {
                    await _db.SaveChangesAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                errors.Add($"System Error: {ex.Message}");
            }

            return new BulkImportLeadsResponse(total, success, duplicates, errors);
        }

        private LeadStatus MapStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status)) return LeadStatus.New;

            var s = status.Trim().ToLower();
            return s switch
            {
                "new" => LeadStatus.New,
                "contacted" => LeadStatus.Contacted,
                "consulted" => LeadStatus.Consulted,
                "qualified" => LeadStatus.Qualified,
                "converted" => LeadStatus.Converted,
                "hot" => LeadStatus.Hot,
                "warm" => LeadStatus.Warm,
                "cold" => LeadStatus.Cold,
                "lost" => LeadStatus.Lost,
                "interested" => LeadStatus.Consulted,
                "not interested" => LeadStatus.Lost,
                _ => LeadStatus.New
            };
        }
    }

    public class LeadCsvRecord
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Source { get; set; }
        public string? Status { get; set; }
        public string? Reason { get; set; }
    }
}
