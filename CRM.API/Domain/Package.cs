using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Domain
{
    public class Package
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int DurationInDays { get; set; }
        public decimal Cost { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsDeleted { get; set; }
        public DateTime? DeletedAt { get; set; }

    }
}