export const addFavorite = (id: string) => {
  const favs = JSON.parse(localStorage.getItem("favs") || "[]")
  favs.push(id)
  localStorage.setItem("favs", JSON.stringify(favs))
}

export const getFavorites = () => {
  return JSON.parse(localStorage.getItem("favs") || "[]")
}
