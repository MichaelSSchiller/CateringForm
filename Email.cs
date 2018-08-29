using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SRHCafe.Models
{
    public class Email
    {
        public string Name { get; set; }
        public string email { get; set; }
        public string Phone { get; set; }
        public string Name2 { get; set; }
        public string email2 { get; set; }
        public string Phone2 { get; set; }
        public string EventTitle { get; set; }
        public string EventLoc { get; set; }
        public string EventDate { get; set; }
        public string DeliveryTime { get; set; }
        public string CleanupTime { get; set; }
        public string CostCenter { get; set; }
        public int CreditCard { get; set; }
        public string GrandTotal { get; set; }
        public string ToRecipient { get; set; }
        public IEnumerable<Item> Items { get; set; }
    } 
}