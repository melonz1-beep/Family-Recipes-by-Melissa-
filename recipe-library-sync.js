(() => {
  const RECIPES_PATH = "melissasRecipeBinder/recipes";
  const LOCAL_KEY = "melissasRecipeBinderBackupV2";
  const recipes = Array.isArray(window.MELISSA_BUILT_IN_RECIPES)
    ? window.MELISSA_BUILT_IN_RECIPES
    : [];

  const normalize = (recipe = {}) => ({
    category: recipe.category || "Other",
    title: String(recipe.title || "Untitled Recipe").trim(),
    ingredients: String(recipe.ingredients || ""),
    directions: String(recipe.directions || ""),
    notes: String(recipe.notes || ""),
    rating: String(recipe.rating || ""),
    photo: ""
  });

  const keyFor = recipe => String(recipe?.title || "").trim().toLowerCase();

  const toArray = value => {
    if (Array.isArray(value)) return value.filter(Boolean).map(normalize);
    if (value && typeof value === "object") {
      return Object.values(value).filter(Boolean).map(normalize);
    }
    return [];
  };

  const merge = (first, second) => {
    const result = [];
    const seen = new Set();
    [...toArray(first), ...toArray(second)].forEach(recipe => {
      const key = keyFor(recipe);
      if (!key || seen.has(key)) return;
      seen.add(key);
      result.push(recipe);
    });
    return result;
  };

  // Repair the on-device copy immediately so all categories can render even
  // before Firebase finishes connecting.
  try {
    const local = JSON.parse(localStorage.getItem(LOCAL_KEY) || "null") || {};
    local.recipes = merge(local.recipes, recipes);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(local));
  } catch (error) {
    console.warn("Could not repair the on-device recipe library", error);
  }

  const syncToFirebase = () => {
    if (!recipes.length || !window.firebase) return;

    try {
      if (!firebase.apps.length && window.MELISSA_FIREBASE_CONFIG) {
        firebase.initializeApp(window.MELISSA_FIREBASE_CONFIG);
      }

      if (!firebase.apps.length) return;

      firebase.database().ref(RECIPES_PATH).transaction(current => {
        return merge(current, recipes);
      }).then(result => {
        window.dispatchEvent(new CustomEvent("melissa-recipes-repaired", {
          detail: { committed: Boolean(result.committed), count: recipes.length }
        }));
      }).catch(error => {
        console.error("Could not repair Firebase recipes", error);
      });
    } catch (error) {
      console.error("Recipe repair could not start", error);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncToFirebase, { once: true });
  } else {
    syncToFirebase();
  }
})();
