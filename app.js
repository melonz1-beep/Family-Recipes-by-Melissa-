import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref, onValue, set } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = document.getElementById("splash");
    if (splash) splash.classList.add("hide");
  }, 2200);
});

/*
  const firebaseConfig = {
  apiKey: "AIzaSyCSVjnXaDyOQnqNx6HXjwYNqrJu96v8V_U",
  authDomain: "family-recipes-by-melissa.firebaseapp.com",
  databaseURL: "https://family-recipes-by-melissa-default-rtdb.firebaseio.com",
  projectId: "family-recipes-by-melissa",
  storageBucket: "family-recipes-by-melissa.firebasestorage.app",
  messagingSenderId: "644873856163",
  appId: "1:644873856163:web:1b184c62882c7ae0ff8b16",
  measurementId: "G-CJZ66HXCZN"
};

const firebaseConfig = {
  apiKey: "PASTE-YOUR-API-KEY-HERE",
  authDomain: "PASTE-YOUR-PROJECT-ID.firebaseapp.com",
  databaseURL: "https://PASTE-YOUR-PROJECT-ID-default-rtdb.firebaseio.com",
  projectId: "PASTE-YOUR-PROJECT-ID",
  storageBucket: "PASTE-YOUR-PROJECT-ID.appspot.com",
  messagingSenderId: "PASTE-SENDER-ID",
  appId: "PASTE-APP-ID"
};

const starterRecipes = [
  {
    category:"Breakfast",
    title:"Hash Brown Crust Breakfast Casserole",
    ingredients:"30 oz thawed hash browns\n3 tbsp melted butter\n1 lb breakfast sausage\n8 oz mushrooms, sliced\n2 cups spinach\n10 eggs\n1 cup milk\n2 cups shredded cheddar cheese\nSalt, pepper, garlic powder, onion powder",
    directions:"Press hash browns with butter into a greased 9x13 pan. Bake at 425°F for 20-25 minutes. Cook sausage, mushrooms, and spinach. Layer over crust. Whisk eggs, milk, and seasonings. Pour over filling. Top with cheese. Bake at 375°F for 30-35 minutes.",
    notes:"Freezes well. Cool completely before freezing.",
    rating:""
  },
  {
    category:"Breakfast",
    title:"Cinnamon Roll Casserole",
    ingredients:"2 cans cinnamon rolls\n4 eggs\n1/2 cup milk or cream\n1 tsp vanilla\n1 tsp cinnamon",
    directions:"Cut cinnamon rolls into pieces. Place in greased baking dish. Whisk eggs, milk, vanilla, and cinnamon. Pour over rolls. Bake at 350°F for 25-30 minutes. Add icing after baking.",
    notes:"Best frozen after baking.",
    rating:""
  },
  {
    category:"Dinner",
    title:"Chicken Casserole",
    ingredients:"Add ingredients here...",
    directions:"Add directions here...",
    notes:"",
    rating:""
  },
  {
    category:"Desserts",
    title:"Family Favorite Dessert",
    ingredients:"Add ingredients here...",
    directions:"Add directions here...",
    notes:"",
    rating:""
  },
  {
    category:"Crockpot / Slow Cooker",
    title:"Slow Cooker Dinner",
    ingredients:"Add ingredients here...",
    directions:"Add directions here...",
    notes:"",
    rating:""
  }
];

const defaultState = {
  recipes: starterRecipes,
  mealPlan:"",
  freezer:[],
  shopping:[],
  christmas:"Breakfast casserole\nDinner menu\nDesserts\nShopping list",
  easter:"Brunch menu\nDinner menu\nDesserts",
  mothersDay:"Brunch ideas\nFamily favorites",
  thanksgiving:"Turkey day sides\nBreakfast for the weekend\nDesserts",
  gatherings:"Birthdays, cookouts, family dinners, and potlucks",
  familyNotes:""
};

const categories = [
  "Breakfast","Lunch","Dinner","Desserts","Appetizers","Side Dishes",
  "Soups & Stews","Crockpot / Slow Cooker","Instant Pot","Freezer Meals",
  "Holiday Recipes","Family Favorites","Other"
];

const $ = id => document.getElementById(id);
let app, db, dataRef;
let state = structuredClone(defaultState);
let loaded = false;
let saveTimer = null;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  dataRef = ref(db, "melissasRecipeBinder");
  $("status").textContent = "Connected to Firebase";
} catch (err) {
  $("status").textContent = "Firebase config needs to be added";
  console.error(err);
}

if (dataRef) {
  onValue(dataRef, snapshot => {
    const data = snapshot.val();
    if (data) {
      state = {...structuredClone(defaultState), ...data};
    } else {
      set(dataRef, defaultState);
      state = structuredClone(defaultState);
    }
    loaded = true;
    syncInputs();
    renderAll();
    $("status").textContent = "Saved online with Firebase";
  }, error => {
    $("status").textContent = "Firebase connection error";
    console.error(error);
  });
}

function saveNow(){
  if (!dataRef || !loaded) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    set(dataRef, state);
    $("status").textContent = "Saved online";
  }, 400);
}

document.querySelectorAll("nav button").forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll("nav button,.tab").forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
  };
});

function syncInputs(){
  ["mealPlan","christmas","easter","mothersDay","thanksgiving","gatherings","familyNotes"].forEach(id=>{
    if (document.activeElement !== $(id)) $(id).value = state[id] || "";
  });
}

["mealPlan","christmas","easter","mothersDay","thanksgiving","gatherings","familyNotes"].forEach(id=>{
  $(id).oninput=()=>{state[id]=$(id).value; saveNow();};
});

$("categoryFilter").onchange = renderRecipes;
$("searchBox").oninput = renderRecipes;

function categoryOptions(selected){
  return categories.map(c=>`<option ${c===selected?"selected":""}>${c}</option>`).join("");
}

function renderRecipes(){
  $("recipeList").innerHTML = "";
  const filter = $("categoryFilter").value || "All";
  const search = ($("searchBox").value || "").toLowerCase().trim();

  state.recipes.forEach((r,i)=>{
    const haystack = `${r.title} ${r.category} ${r.ingredients} ${r.directions} ${r.notes} ${r.rating}`.toLowerCase();
    if (filter !== "All" && r.category !== filter) return;
    if (search && !haystack.includes(search)) return;

    const div=document.createElement("div");
    div.className="card";
    div.innerHTML=`
      <div class="card-title">
        <h3>${escapeHtml(r.title || "Untitled Recipe")}</h3>
        <span class="badge">${escapeHtml(r.category || "Other")}</span>
      </div>
      <label>Category</label><select data-i="${i}" data-field="category">${categoryOptions(r.category || "Other")}</select>
      <label>Recipe Name</label><input value="${escapeHtml(r.title)}" data-i="${i}" data-field="title">
      <label>Ingredients</label><textarea data-i="${i}" data-field="ingredients">${escapeHtml(r.ingredients)}</textarea>
      <label>Directions</label><textarea data-i="${i}" data-field="directions">${escapeHtml(r.directions)}</textarea>
      <label>Notes / Freezer Instructions / Changes</label><textarea data-i="${i}" data-field="notes">${escapeHtml(r.notes)}</textarea>
      <label>Family Rating / Favorite Comments</label><textarea data-i="${i}" data-field="rating">${escapeHtml(r.rating)}</textarea>
      <div class="actions"><button onclick="deleteRecipe(${i})" class="danger">Delete Recipe</button></div>`;
    $("recipeList").appendChild(div);
  });

  document.querySelectorAll("#recipeList input,#recipeList textarea,#recipeList select").forEach(el=>{
    el.oninput=()=>{
      state.recipes[el.dataset.i][el.dataset.field]=el.value;
      saveNow();
      if (el.dataset.field === "title" || el.dataset.field === "category") renderRecipes();
    };
    el.onchange=el.oninput;
  });
}

window.deleteRecipe = function(i){
  state.recipes.splice(i,1);
  saveNow();
  renderRecipes();
};

$("addRecipeBtn").onclick=()=>{
  state.recipes.push({category:"Dinner",title:"New Recipe",ingredients:"",directions:"",notes:"",rating:""});
  saveNow();
  renderRecipes();
};

function renderList(id, arr){
  $(id).innerHTML="";
  arr.forEach((item,i)=>{
    const li=document.createElement("li");
    li.className=item.done?"done":"";
    li.innerHTML=`<input type="checkbox" ${item.done?"checked":""} onchange="toggleItem('${id}',${i})"> ${escapeHtml(item.text)} ${item.date?`<span class="small">(${item.date})</span>`:""} <button onclick="removeItem('${id}',${i})" class="danger">x</button>`;
    $(id).appendChild(li);
  });
}

window.toggleItem = function(id,i){
  const arr=id==="shoppingList"?state.shopping:state.freezer;
  arr[i].done=!arr[i].done;
  saveNow();
  renderAll();
};

window.removeItem = function(id,i){
  const arr=id==="shoppingList"?state.shopping:state.freezer;
  arr.splice(i,1);
  saveNow();
  renderAll();
};

$("addShoppingBtn").onclick=()=>{
  if($("shoppingItem").value.trim()){
    state.shopping.push({text:$("shoppingItem").value.trim(),done:false});
    $("shoppingItem").value="";
    saveNow();
    renderAll();
  }
};

$("addFreezerBtn").onclick=()=>{
  if($("freezerItem").value.trim()){
    state.freezer.push({text:$("freezerItem").value.trim(),date:$("freezerDate").value,done:false});
    $("freezerItem").value="";
    $("freezerDate").value="";
    saveNow();
    renderAll();
  }
};

$("exportBtn").onclick=()=>{
  const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="melissas-recipe-binder-backup.json";
  a.click();
};

$("resetBtn").onclick=()=>{
  if(confirm("Reset the online recipe binder to the starter recipes?")){
    state = structuredClone(defaultState);
    set(dataRef, state);
  }
};

function renderAll(){
  renderRecipes();
  renderList("shoppingList",state.shopping || []);
  renderList("freezerList",state.freezer || []);
}

function escapeHtml(str){
  return String(str||"").replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
}

renderAll();

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
