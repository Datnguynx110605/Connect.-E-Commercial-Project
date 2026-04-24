using Connect.Domain.Core.ValueObjects;
using System;
using System.Collections.Generic;
using System.Text;

namespace Connect.Domain.Core.Entities
{
    public class Category
    {
        public int CategoryID { get; private set; }
        public CategoryName CategoryName { get; private set; }
        private Category() { }
        private Category(CategoryName name)
        {
            CategoryName = name;
        }

        public static Category CreateCategory(CategoryName name)
        {
            return new Category(name);
        }

        public void UpdateCategoryName(CategoryName name)
        {
            CategoryName = name;
        }
    }
}
