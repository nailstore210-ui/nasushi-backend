
let cart = [];
let selectedPrices = {};
let points = 0;
let currentLang = "ar";

const API_URL = window.location.hostname.includes("localhost") 
  ? "http://localhost:3000" 
  : "https://nasushi-backend.onrender.com";

// 📝 الترجمات
const translations = {
  ar: {title:"NA_SUSHI_21 - الطعام الياباني بأيادي جزائرية", cartTitle:"🛒 سلة المشتريات", cartTotal:"المجموع: ", formTitle:"📝 بيانات الزبون", confirmBtn:"تأكيد الطلب", notification:"✅ تم تسجيل طلبك: ", points:"رصيد نقاطك: "},
  fr: {title:"NA_SUSHI_21 - Cuisine Japonaise", cartTitle:"🛒 Panier", cartTotal:"Total: ", formTitle:"📝 Informations du client", confirmBtn:"Confirmer la commande", notification:"✅ Votre commande est enregistrée: ", points:"Vos points fidélité: "},
  en: {title:"NA_SUSHI_21 - Japanese Food", cartTitle:"🛒 Shopping Cart", cartTotal:"Total: ", formTitle:"📝 Customer Information", confirmBtn:"Confirm Order", notification:"✅ Your order has been placed: ", points:"Your loyalty points: "}
};


// 📝 تحديد السعر حسب المنتج والحشو
function updatePrice(item, choice) {
  let price = 0;
  // ... كل شروط الأسعار كما عندك (California Roll, Crispy Roll, Futomaki, Hosomaki, Dragon Roll, Nigiri, Gyoza, Crunchy Roll, Futomaki chesse, California roll chesse, Les Nems, Les Sauces, Chop Sticks) ...
  document.getElementById(item+"-price").innerText = "السعر: " + price + " DA";
  selectedPrices[item] = price;
}

// 🛒 إضافة للسلة
function addToCart(item){
  let price = selectedPrices[item];
  if(!price || price === 0){
    alert("⚠️ اختر الحشو أولاً!");
    return;
  }
  cart.push({name:item, price:price});
  updateCart();
}

// 🗑️ حذف عنصر
function removeItem(index){
  cart.splice(index,1);
  updateCart();
}

// 🚚 حساب سعر التوصيل حسب المنطقة
function getDeliveryPrice(area){
  const free = ["تفاحي","adll فلفلة","الفتوي","قرية لعرايس"];
  if(free.includes(area)) return 0;
  const hundred = ["بلاطان","القرية","الغطسة","ليابيي"];
  if(hundred.includes(area)) return 100;
  const oneFifty = ["شاطئ 8","شاطئ 10","الماناج"];
  if(oneFifty.includes(area)) return 150;
  const twoHundred = ["شاطئ 7","القرية السياحية","مارينا دور","سانتيفي","الجامعة","الاقامات الجامعية للإناث","الاقامات الجامعية للذكور","الحدائق"];
  if(twoHundred.includes(area)) return 200;
  const twoFifty = ["بوزعرورة","كوسيدار","جان دارك","لابيسين","adll بوزعرورة"];
  if(twoFifty.includes(area)) return 250;
  const threeHundred = ["33","حمادي كرومة","فالي","لاسيا","ليزالي","لبلاد","كامي","مرج الديب","بوبعلى","فوبور","واد الوحش","مسيون 1","مسيون 2","سانسو","سيسال","فاووث","ليباتيمو الشناوة","صالح بولكروة","زفزاف 1","زفزاف 2"];
  if(threeHundred.includes(area)) return 300;
  return -1;
}

// 🛒 تحديث السلة
function updateCart(){
  const cartList = document.getElementById("cartItems");
  cartList.innerHTML = "";
  let total = 0;
  cart.forEach((item, index)=>{
    total += item.price;
    cartList.innerHTML += `<li>${item.name} - ${item.price} DA 
      <button onclick="removeItem(${index})">❌</button></li>`;
  });
  document.getElementById("cartTotal").innerText = total;

  const area = document.getElementById("custArea") ? document.getElementById("custArea").value : "";
  let deliveryPrice = getDeliveryPrice(area);
  let deliveryMessage = "";

  if(deliveryPrice === 0 && area !== ""){
    deliveryMessage = "🎉 تهانينا، التوصيل مجاني!";
  }
  if(deliveryPrice === -1){
    deliveryPrice = 0;
    deliveryMessage = "⚠️ المنطقة غير مدعومة، يرجى التواصل معنا.";
  }

  document.getElementById("deliveryPrice").innerText = deliveryPrice;
  document.getElementById("deliveryMessage").innerText = deliveryMessage;
  document.getElementById("finalTotal").innerText = total + deliveryPrice;
}

// 📝 دالة تأكيد الطلبية
async function confirmOrder(event){
  event.preventDefault();
  const phone = document.getElementById("custPhone").value;
  const phoneError = document.getElementById("phoneError");
  const area = document.getElementById("custArea").value;

  if(!/^[0-9]{10}$/.test(phone)){
    phoneError.style.display = "block";
    return;
  } else {
    phoneError.style.display = "none";
  }

  if(cart.length === 0){
    alert("⚠️ السلة فارغة!");
    return;
  }

  let deliveryPrice = getDeliveryPrice(area);
  if(deliveryPrice === -1){
    alert("⚠️ المنطقة غير مدعومة، يرجى التواصل معنا عبر واتساب أو فيسبوك/إنستغرام.");
    return;
  }

  let total = cart.reduce((sum, item)=> sum + item.price, 0) + deliveryPrice;

  const order = {
    name: document.getElementById("custName").value,
    phone: phone,
    area: area,
    total: total,
    products: cart,
    time: new Date().toLocaleString(),
    usedPoints: parseInt(document.getElementById("usedPoints")?.value) || 0
  };

  try {
    const response = await fetch(`${API_URL}/order`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(order)
    });

    const result = await response.json();

    if(result.status === "success"){
      alert(`✅ تم إرسال الطلب! رقم الطلب: ${result.orderId}`);
      document.getElementById("pointsBalance").textContent = result.newBalance;

      document.getElementById("orderSummary").style.display = "block";
      let productNames = cart.map(item => item.name + " (" + item.price + " DA)").join("، ");
      document.getElementById("summaryItems").innerText = "المنتجات المختارة: " + productNames;
      document.getElementById("summaryDelivery").innerText = "سعر التوصيل: " + deliveryPrice + " DA";
      document.getElementById("summaryTotal").innerText = "المجموع الكلي مع التوصيل: " + total + " DA";
      document.getElementById("summaryPoints").innerText = "🪙 رصيدك الحالي: " + result.newBalance;

      cart = [];
      updateCart();
      document.getElementById("orderForm").reset();
    } else {
      alert("❌ صار مشكل في إرسال الطلب.");
    }
  } catch(err){
    console.error("خطأ في الاتصال بالسيرفر:", err);
    alert("⚠️ السيرفر ما راهوش يرد.");
  }
}

// ✅ زر تحديث رصيد النقاط
const checkBtn = document.getElementById("checkPoints");
if (checkBtn) {
  checkBtn.addEventListener("click", async () => {
    const phone = document.getElementById("custPhone").value.trim();
    if (!phone) {
      alert("⚠️ لازم تدخل رقم الهاتف أولا.");
      return;
    }
    const response = await fetch(`${API_URL}/points/${phone}`);
    const result = await response.json();
    document.getElementById("pointsBalance").textContent = result.points;
  });
}

// أول مرة نحدث السلة
updateCart();
