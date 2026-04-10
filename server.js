const express = require("express");
const fs = require("fs");
const twilio = require("twilio");
const PDFDocument = require("pdfkit");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static("NASUSHI21"));

// إعداد Twilio
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

// 🗂️ دوال مساعدة لملف العملاء
function readCustomers() {
  if (!fs.existsSync("customers.json")) return {};
  return JSON.parse(fs.readFileSync("customers.json", "utf8"));
}

function writeCustomers(customers) {
  fs.writeFileSync("customers.json", JSON.stringify(customers, null, 2), "utf8");
}

// ✅ Route لطلبية جديدة
app.post("/order", (req, res) => {
  const order = req.body;

  // 🆔 توليد رقم طلب
  const orderId = "ORD-" + Date.now();
  order.id = orderId;

  // 🪙 النقاط المستعملة
  const usedPoints = Number(order.usedPoints) || 0;

  // 📂 قراءة العملاء
  let customers = readCustomers();
  const customerKey = order.phone;
  if (!customers[customerKey]) {
    customers[customerKey] = { name: order.name, phone: order.phone, points: 0 };
  }

  // 🔄 رصيد الزبون الحالي
  let currentPoints = customers[customerKey].points;

  // ✅ إذا استعمل نقاط → ننقصها فقط
  if (currentPoints >= usedPoints) {
    currentPoints -= usedPoints;
  } else {
    return res.send({ status: "error", message: "رصيد النقاط غير كافي" });
  }

  // ✅ إذا ما استعملش نقاط → نحسب النقاط المكتسبة
  let earnedPoints = 0;
  if (usedPoints === 0) {
    earnedPoints = Math.floor(Number(order.total) / 100);
    currentPoints += earnedPoints;
  }

  // تحديث رصيد الزبون
  customers[customerKey].points = currentPoints;

  // 🗂️ تخزين الطلب
  order.pointsEarned = earnedPoints;
  order.pointsUsed = usedPoints;
  order.pointsBalance = currentPoints;
  fs.appendFileSync("orders.txt", JSON.stringify(order) + "\n", "utf8");

  // 🗂️ تخزين رصيد الزبون
  writeCustomers(customers);

  // 📲 إرسال الطلب لواتساب
  client.messages.create({
    from: "whatsapp: +18179694333", // رقم Sandbox
    to: "whatsapp:+213792106084",  // رقمك بصيغة دولية
    body: `طلب جديد 🛒
🆔 رقم الطلب: ${order.id}
👤 الاسم: ${order.name}
📞 الهاتف: ${order.phone}
📍 المنطقة: ${order.area}
💰 المجموع: ${order.total} DA
🪙 النقاط المستعملة: ${order.pointsUsed}
🪙 النقاط المكتسبة: ${order.pointsEarned}
🪙 الرصيد الجديد: ${order.pointsBalance}
🕒 الوقت: ${order.time}
📦 المنتجات: ${order.products.map(p => p.name).join(", ")}`
  }).then(() => {
    console.log("✅ تم إرسال الطلب إلى واتساب");
  }).catch(err => {
    console.error("❌ خطأ في إرسال واتساب:", err);
  });

  // ✅ توليد فاتورة PDF
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, `invoice-${orderId}.pdf`);
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  // 🖼️ شعار المطعم
  doc.image(path.join(__dirname, "logo.png"), {
    fit: [100, 100],
    align: "center",
    valign: "top"
  });
  doc.moveDown(2);

  doc.fontSize(20).text("فاتورة الطلبية", { align: "center" });
  doc.moveDown();
  doc.fontSize(14).text(`🆔 رقم الطلب: ${orderId}`);
  doc.text(`👤 الاسم: ${order.name}`);
  doc.text(`📞 الهاتف: ${order.phone}`);
  doc.text(`📍 المنطقة: ${order.area}`);
  doc.text(`🕒 الوقت: ${order.time}`);
  doc.moveDown();

  // 📦 المنتجات
  doc.fontSize(16).text("📦 المنتجات:", { underline: true });
  doc.moveDown();

  order.products.forEach(p => {
    doc.text(`${p.name} : ${p.price} DA`);
  });

  doc.moveDown();
  doc.fontSize(14).text(`💰 المجموع: ${order.total} DA`);
  doc.text(`🪙 النقاط المستعملة: ${order.pointsUsed}`);
  doc.text(`🪙 الرصيد الجديد: ${order.pointsBalance}`);

  // ✅ التذييل
  doc.moveDown(4);
  doc.fontSize(12).text("📞 للتواصل: 0792 106 084", { align: "center" });
  doc.text("📸 تابعنا على إنستغرام: @nattsushi", { align: "center" });
  doc.text("🌐 موقعنا: www.nattsushi.com", { align: "center" });

  doc.end();

  // ✅ لازم نستنى حتى يخلص توليد الملف
  stream.on("finish", () => {
    // نوجه مباشرة لرابط الفاتورة
    res.redirect(`/invoice/${orderId}`);
  });
});

// ✅ Route لعرض الفاتورة PDF مباشرة
app.get("/invoice/:id", (req, res) => {
  const filePath = path.join(__dirname, `invoice-${req.params.id}.pdf`);
  res.sendFile(filePath, {
    headers: {
      "Content-Type": "application/pdf"
    }
  });
});

// ✅ Route مستقل لعرض رصيد النقاط
app.get("/points/:phone", (req, res) => {
  const customers = readCustomers();
  const phone = req.params.phone;
  if (customers[phone]) {
    res.send({ points: customers[phone].points });
  } else {
    res.send({ points: 0 });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`));
