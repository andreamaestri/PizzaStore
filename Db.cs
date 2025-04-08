namespace PizzaStore.DB; 

 public record Pizza 
 {
   public int Id {get; set;} 
   public string ? Name { get; set; }
 }

 public class PizzaDB
 {
    private static List<Pizza> _pizzas = new List<Pizza>()
    {
        new Pizza{ Id=1, Name="Montemagno, Pizza shaped like a great mountain" },
        new Pizza{ Id=2, Name="The Galloway, Pizza shaped like a submarine, silent but deadly"},
        new Pizza{ Id=3, Name="The Noring, Pizza shaped like a Viking helmet, where's the mead"},
        new Pizza{ Id=4, Name="The Poldark, A Cornish delight with seafood and saffron"},
        new Pizza{ Id=5, Name="The Vesuvio, A fiery Italian classic with a kick"},
        new Pizza{ Id=6, Name="Margherita Regina, The queen of pizzas, simple tomato, mozzarella, basil"},
        new Pizza{ Id=7, Name="Roman Holiday, Artichoke hearts, prosciutto, olives, a taste of Rome"},
        new Pizza{ Id=8, Name="Amalfi Lemon Twist, Zesty lemon base, shrimp, rocket, sunshine on a plate"},
        new Pizza{ Id=9, Name="Quattro Formaggi Forte, A powerful blend of four Italian cheeses"},
        new Pizza{ Id=10, Name="Cornish Pasty Calzone, Steak, potato, swede, onion, folded like a pasty"},
        new Pizza{ Id=11, Name="Stargazy Surprise, Sardines (heads optional!), egg, potato on a creamy base"},
        new Pizza{ Id=12, Name="Yarg & Wild Garlic Whirl, Creamy Cornish Yarg cheese with wild garlic pesto"},
        new Pizza{ Id=13, Name="Fisherman's Friend, Local white fish, capers, samphire, a taste of the coast"}
    };


   public static List<Pizza> GetPizzas() 
   {
     return _pizzas;
   } 

   public static Pizza ? GetPizza(int id) 
   {
     return _pizzas.SingleOrDefault(pizza => pizza.Id == id);
   } 

   public static Pizza CreatePizza(Pizza pizza) 
   {
     _pizzas.Add(pizza);
     return pizza;
   }

   public static Pizza UpdatePizza(Pizza update) 
   {
     _pizzas = _pizzas.Select(pizza =>
     {
       if (pizza.Id == update.Id)
       {
         pizza.Name = update.Name;
       }
       return pizza;
     }).ToList();
     return update;
   }

   public static void RemovePizza(int id)
   {
     _pizzas = _pizzas.FindAll(pizza => pizza.Id != id).ToList();
   }
 }