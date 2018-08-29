using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace SRHCafe.Models
{
    public class Item
    {
        public string Name { get; set; }
        public string Price { get; set; }
        public IEnumerable<Item> SubOptions { get; set; }
        public int NumberOfPeople { get; set; }
        public int NumberOfEntrees { get; set; }
        public int QTY { get; set; }
    }
}