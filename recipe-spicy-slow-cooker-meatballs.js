(()=>{
const recipe={category:"Crockpot / Slow Cooker",title:"Spicy Slow Cooker Meatballs",ingredients:"24 oz frozen meatballs\n1 1/2 cups ketchup\n1 cup honey\n1/2 cup soy sauce\n2 tbsp brown sugar\n1 1/2 tsp garlic powder\n1 tbsp sriracha, or more to taste",directions:"1. Add the frozen meatballs to the slow cooker. Pour the ketchup, honey, soy sauce, garlic powder, brown sugar, and sriracha over the meatballs.\n2. Gently stir, cover, and cook on LOW for 4-6 hours or on HIGH for 2-3 hours, until the meatballs are tender and the sauce is hot.",notes:"Source: A Wicked Whisk. Makes about 48 meatballs. Prep time: 5 minutes. Cook time: 2-6 hours, depending on the setting. This recipe can be doubled. Reheat in the microwave for about 30 seconds. Add more sriracha for extra heat or reduce it for a milder sauce.",rating:"",photo:""};
const addRecipe=()=>{
if(typeof firebase==="undefined"||!firebase.apps||!firebase.apps.length){setTimeout(addRecipe,500);return}
const recipesRef=firebase.database().ref("melissasRecipeBinder/recipes");
recipesRef.transaction(current=>{
const recipes=Array.isArray(current)?current:[];
const exists=recipes.some(r=>(r&&r.title||"").trim().toLowerCase()===recipe.title.toLowerCase());
if(exists)return;
return [recipe,...recipes];
});
};
setTimeout(addRecipe,500);
})();
