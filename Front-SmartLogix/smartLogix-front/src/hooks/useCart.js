export function useCart() {
  const addProduct = (producto) => {
    console.log("Despachando al carrito global:", producto.name);
    alert(`¡Se agregó "${producto.name}" a la orden de logística!`);
  };

  return { addProduct };
}